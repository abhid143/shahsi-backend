import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { PaymentsService } from '../payments/application/payments.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BridalPartyService {
  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
  ) {}

  // ✅ CREATE EVENT
  async createEvent(userId: string, name: string, eventDate: Date) {
    return this.prisma.bridalPartyEvent.create({
      data: {
        organizerUserId: userId,
        name,
        eventDate,
        status: 'active',
      },
    });
  }

  // ✅ INVITE MEMBER (TOKEN BASED)
async inviteMember(eventId: string, email: string) {
  const token = uuidv4();

  const invite = await this.prisma.bridalPartyInvite.create({
    data: {
      eventId,
      email,
      token,
      status: 'sent',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    },
  });

  return {
    message: 'Invite created',
    token: invite.token,
    joinUrl: `http://localhost:3000/bridal-party/join/${invite.token}`,
  };
}

  // 🔥 ACCEPT INVITE (JOIN FLOW)
async acceptInvite(token: string, userId: string) {
  const invite = await this.prisma.bridalPartyInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    throw new Error('Invalid invite');
  }

  if (invite.status !== 'sent') {
    throw new Error('Invite already used or expired');
  }

  if (invite.expiresAt < new Date()) {
    throw new Error('Invite expired');
  }

  // create member
  const member = await this.prisma.bridalPartyMember.create({
    data: {
      eventId: invite.eventId,
      userId,
      email: invite.email,
      role: 'bridesmaid',
      status: 'joined',
    },
  });

  // mark invite accepted
  await this.prisma.bridalPartyInvite.update({
    where: { token },
    data: { status: 'accepted' },
  });

  return {
    message: 'Joined successfully',
    member,
  };
}

  // ✅ SELECT DRESS
  async selectDress(memberId: string, productId: string) {
    const member = await this.prisma.bridalPartyMember.findUnique({
      where: { id: memberId },
    });

    if (!member) throw new Error('Member not found');

    await this.prisma.bridalPartySelection.create({
      data: {
        eventId: member.eventId,
        memberId,
        productId,
        status: 'selected',
      },
    });

    return this.prisma.bridalPartyMember.update({
      where: { id: memberId },
      data: { status: 'selected' },
    });
  }

  // 📏 SUBMIT SIZE + PREFERENCE
  async submitSize(
    memberId: string,
    size: string,
    preference?: string,
  ) {
    const member = await this.prisma.bridalPartyMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // 🔥 VALIDATION (IMPORTANT)
    if (member.status !== 'joined') {
      throw new Error('Invalid status. Member must be in joined state');
    }

    return this.prisma.bridalPartyMember.update({
      where: { id: memberId },
      data: {
        size,
        preference,
        status: 'size_submitted', // ✅ STATUS UPDATE
      },
    });
  }

  // ✅ MARK PAYMENT
  async createMemberPayment(memberId: string, selectionId: string) {
    const member = await this.prisma.bridalPartyMember.findUnique({
      where: { id: memberId },
    });

    if (!member) throw new Error('Member not found');

    // 🔥 PASS selectionId (NOT amount)
    return this.payments.createBridalPayment(
      member.eventId,
      memberId,
      selectionId,
    );
  }

  // 🔥 ASSIGN DRESS (ADMIN FLOW)
  async assignDress(memberId: string, productId: string, variantId?: string) {
  const member = await this.prisma.bridalPartyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) throw new Error('Member not found');

  if (member.status !== 'size_submitted') {
    throw new Error('Member must submit size first');
  }

  return this.prisma.bridalPartySelection.create({
    data: {
      eventId: member.eventId,
      memberId,
      productId,
      variantId,
      status: 'assigned',
    },
  });
}

  // 🔥 SELECT ASSIGNED DRESS (MEMBER FLOW)
  async selectAssignedDress(memberId: string, selectionId: string) {
  const selection = await this.prisma.bridalPartySelection.findUnique({
    where: { id: selectionId },
  });

  if (!selection) throw new Error('Selection not found');

  if (selection.memberId !== memberId) {
    throw new Error('Unauthorized selection');
  }

  await this.prisma.bridalPartySelection.update({
    where: { id: selectionId },
    data: { status: 'selected' },
  });

  return this.prisma.bridalPartyMember.update({
    where: { id: memberId },
    data: { status: 'selected' },
  });
}

  // 🔥 APPROVE DRESS (ADMIN FLOW)
  async approveDress(memberId: string, selectionId: string) {
  const selection = await this.prisma.bridalPartySelection.findUnique({
    where: { id: selectionId },
  });

  if (!selection) throw new Error('Selection not found');

  if (selection.memberId !== memberId) {
    throw new Error('Unauthorized');
  }

  await this.prisma.bridalPartySelection.update({
    where: { id: selectionId },
    data: { status: 'approved' },
  });

  return this.prisma.bridalPartyMember.update({
    where: { id: memberId },
    data: { status: 'approved' },
  });
}

  // 🔥 CALCULATE AMOUNT (DYNAMIC PRICING LATER)
  async calculateMemberAmount(memberId: string) {
  const selection = await this.prisma.bridalPartySelection.findFirst({
    where: { memberId, status: 'approved' },
  });

  if (!selection) {
    throw new Error('No approved selection');
  }

  // TODO: dynamic pricing later
  return 100;
}

  // 🔥 CREATE PAYMENT FOR MEMBER (STRIPE FLOW)
  async createPaymentForMember(memberId: string) {
  const member = await this.prisma.bridalPartyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) throw new Error('Member not found');

  const amount = await this.calculateMemberAmount(memberId);

  // create payment record
  const payment = await this.prisma.bridalPartyPayment.create({
    data: {
      eventId: member.eventId,
      memberId,
      amount,
      status: 'pending',
    },
  });

  // update member status
  await this.prisma.bridalPartyMember.update({
    where: { id: memberId },
    data: { status: 'payment_pending' },
  });

  return payment;
}

  // 🔥 MARK MEMBER PAID (STRIPE WEBHOOK FLOW)
  async markMemberPaid(memberId: string) {
  const member = await this.prisma.bridalPartyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) throw new Error('Member not found');

  // update payment
  await this.prisma.bridalPartyPayment.updateMany({
    where: {
      memberId,
      status: 'pending',
    },
    data: {
      status: 'paid',
    },
  });

  // update member
  await this.prisma.bridalPartyMember.update({
    where: { id: memberId },
    data: { status: 'paid' },
  });

  // 🔥 CHECK GROUP READY
  await this.checkGroupReady(member.eventId);

  return { message: 'Payment successful' };
}

  async checkGroupReady(eventId: string) {
    const members = await this.prisma.bridalPartyMember.findMany({
      where: { eventId },
    });

    const allPaid = members.every((m) => m.status === 'paid');

    if (allPaid) {
      await this.createGroupOrder(eventId);
    }
  }

// 💳 MANUAL PAYMENT (TESTING FLOW)
  async markPaid(memberId: string, amount: number) {
    const member = await this.prisma.bridalPartyMember.findUnique({
      where: { id: memberId },
    });

    if (!member) throw new Error('Member not found');

    await this.prisma.bridalPartyPayment.create({
      data: {
        eventId: member.eventId,
        memberId,
        amount,
        status: 'paid',
      },
    });

    await this.prisma.bridalPartyMember.update({
      where: { id: memberId },
      data: { status: 'paid' },
    });

    // 🔥 CHECK ALL PAID
    const members = await this.prisma.bridalPartyMember.findMany({
      where: { eventId: member.eventId },
    });

    const allPaid = members.every((m) => m.status === 'paid');

    if (allPaid) {
      await this.createGroupOrder(member.eventId);
    }

    return { message: 'Payment recorded' };
  }

  // 🔥 EVENT STATUS DASHBOARD
  async getEventStatus(eventId: string) {
    const event = await this.prisma.bridalPartyEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new Error('Event not found');

    const members = await this.prisma.bridalPartyMember.findMany({
      where: { eventId },
    });

    const totalMembers = members.length;

    const joined = members.filter((m) => m.status !== 'invited').length;

    const sizeSubmitted = members.filter(
      (m) => m.status === 'size_submitted' || m.status === 'selected' || m.status === 'paid',
    ).length;

    const selected = members.filter(
      (m) => m.status === 'selected' || m.status === 'paid',
    ).length;

    const paid = members.filter((m) => m.status === 'paid').length;

    const pendingPayments = totalMembers - paid;

    const isReadyForOrder = members.every((m) => m.status === 'paid');

    return {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.eventDate,

      totalMembers,
      joined,
      sizeSubmitted,
      selected,
      paid,
      pendingPayments,

      isReadyForOrder,
    };
  }

  // 🚚 CREATE SHIPMENT (AFTER ORDER)
  async createShipment(eventId: string) {
    // 0️⃣ Prevent duplicate shipment (IMPORTANT FIX)
    const existingShipment = await this.prisma.shipment.findFirst({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });

    if (existingShipment) {
      return existingShipment; // 🔥 return latest instead of creating new
    }

    // 1️⃣ Get event
    const event = await this.prisma.bridalPartyEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new Error('Event not found');

    // 2️⃣ Get latest order
    const order = await this.prisma.order.findFirst({
      where: { userId: event.organizerUserId },
      orderBy: { createdAt: 'desc' },
    });

    if (!order) throw new Error('Order not found');

    // 3️⃣ Get selections
    const selections = await this.prisma.bridalPartySelection.findMany({
      where: { eventId },
    });

    if (!selections.length) {
      throw new Error('No selections found for shipment');
    }

    // 4️⃣ Create shipment
    const shipment = await this.prisma.shipment.create({
      data: {
        eventId,
        orderId: order.id,
        status: 'created',
        trackingNumber: `TRK-${Date.now()}`, // always present
        carrier: 'Delhivery',
      },
    });

    // 5️⃣ Create shipment items
    await this.prisma.shipmentItem.createMany({
      data: selections.map((s) => ({
        shipmentId: shipment.id,
        memberId: s.memberId,
        productId: s.productId,
        status: 'packed',
      })),
    });

    return shipment;
  }

  // 🚚 UPDATE SHIPMENT STATUS
async updateShipmentStatus(shipmentId: string, status: string) {
  const allowedStatuses = [
    'created',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid shipment status');
  }

  const shipment = await this.prisma.shipment.findUnique({
    where: { id: shipmentId },
  });

  if (!shipment) throw new Error('Shipment not found');

  return this.prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      // 🔥 ensure tracking always exists
      trackingNumber:
        shipment.trackingNumber || `TRK-${Date.now()}`,
      carrier: shipment.carrier || 'Delhivery',
    },
  });
}

  // 📦 TRACK SHIPMENT
async trackShipment(eventId: string) {
  const shipment = await this.prisma.shipment.findFirst({
    where: { eventId },
    orderBy: { createdAt: 'desc' }, // 🔥 always latest
    include: {
      items: true,
    },
  });

  if (!shipment) {
    throw new Error('Shipment not found');
  }

  return shipment;
}
  
    // 🔥 WEBHOOK FLOW (future Stripe)
    async handlePaymentSuccess(memberId: string, selectionId: string) {
    const member = await this.prisma.bridalPartyMember.findUnique({
      where: { id: memberId },
    });

    if (!member) throw new Error('Member not found');

    await this.prisma.bridalPartyMember.update({
      where: { id: memberId },
      data: { status: 'paid' },
    });

    return {
      message: 'Payment successful',
      memberId,
      selectionId,
      status: 'paid',
    };
  }

  // 🔥 GROUP ORDER
  async createGroupOrder(eventId: string) {
    const selections = await this.prisma.bridalPartySelection.findMany({
      where: { eventId },
    });

    if (selections.length === 0) {
      throw new Error('No selections found');
    }

    const event = await this.prisma.bridalPartyEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new Error('Event not found');

    const items = selections.map((s) => ({
      productId: s.productId,
      quantity: 1,
      price: 100,
    }));

    const total = items.reduce((sum, i) => sum + i.price, 0);

    const order = await this.prisma.order.create({
      data: {
        userId: event.organizerUserId,
        total,
        status: 'PENDING',
        items: {
          create: items,
        },
      },
    });

    await this.prisma.bridalPartyEvent.update({
      where: { id: eventId },
      data: { status: 'ordered' },
    });

    return order;
  }
}
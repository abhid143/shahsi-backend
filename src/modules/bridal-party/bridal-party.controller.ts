import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
  Get,
} from '@nestjs/common';
import { BridalPartyService } from './bridal-party.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { SelectDressDto } from './dto/select-dress.dto';
import { PayDto } from './dto/pay.dto';
import { SizeDto } from './dto/size.dto';
import { AssignDressDto } from './dto/assign-dress.dto';
import { ApproveDressDto } from './dto/approve-dress.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Bridal Party')
@ApiBearerAuth()
@Controller('bridal-party')
@UseGuards(JwtAuthGuard)
export class BridalPartyController {
  constructor(private service: BridalPartyService) {}

  // 🎯 CREATE EVENT
  @Post('event')
  @ApiOperation({ summary: 'Create bridal party event' })
  create(@Req() req, @Body() body: CreateEventDto) {
    return this.service.createEvent(
      req.user.userId,
      body.name,
      new Date(body.eventDate),
    );
  }

  // 📩 INVITE MEMBER
  @Post('invite')
  @ApiOperation({ summary: 'Invite member to event' })
  invite(@Body() body: InviteMemberDto) {
    return this.service.inviteMember(body.eventId, body.email);
  }

  // 👗 SELECT DRESS
  @Post('select')
  @ApiOperation({ summary: 'Select dress for member' })
  select(@Body() body: SelectDressDto) {
    return this.service.selectDress(
      body.memberId,
      body.productId,
    );
  }

  // 💳 MARK PAYMENT (ONLY ONE METHOD — FIXED)
  @Post('pay')
  @ApiOperation({ summary: 'Mark member payment' })
  pay(@Body() body: PayDto) {
    return this.service.markPaid(
      body.memberId,
      body.amount,
    );
  }

  // 🔥 ACCEPT INVITE (JOIN FLOW)
  @Post('join/:token')
  @ApiOperation({ summary: 'Accept invite and join event' })
  join(@Param('token') token: string, @Req() req) {
    return this.service.acceptInvite(token, req.user.userId);
  }

  // 📏 SUBMIT SIZE AND PREFERENCE
  @Post('size')
  @ApiOperation({ summary: 'Submit size and preference' })
  submitSize(@Body() body: SizeDto) {
    return this.service.submitSize(
      body.memberId,
      body.size,
      body.preference,
    );
  }

  // 👗 ASSIGN DRESS TO MEMBER
  @Post('assign')
  @ApiOperation({ summary: 'Assign dress to member' })
  assign(@Body() body: AssignDressDto) {
    return this.service.assignDress(
      body.memberId,
      body.productId,
      body.variantId,
    );
  }

  // SELECT ASSIGNED DRESS 
  @Post('select-assigned')
  @ApiOperation({ summary: 'Member selects assigned dress' })
  selectAssigned(@Body() body: ApproveDressDto) {
    return this.service.selectAssignedDress(
      body.memberId,
      body.selectionId,
    );
  }

  // APPROVE DRESS SELECTION
  @Post('approve')
  @ApiOperation({ summary: 'Approve dress selection' })
  approve(@Body() body: ApproveDressDto) {
    return this.service.approveDress(
      body.memberId,
      body.selectionId,
    );
  }

 // 🔥 CREATE PAYMENT (STRIPE INTEGRATION)
  @Post('payment/create')
  createPayment(@Body() body: any) {
    return this.service.createMemberPayment(
      body.memberId,
      body.selectionId,
    );
  }

  // 🔥 PAYMENT SUCCESS WEBHOOK
  @Post('payment/success')
  success(@Body() body: any) {
    return this.service.handlePaymentSuccess(
      body.memberId,
      body.selectionId,
    );
  }

  // 🔥 GET EVENT STATUS
  @Get('status/:eventId')
  @ApiOperation({ summary: 'Get bridal event dashboard status' })
  getStatus(@Param('eventId') eventId: string) {
    return this.service.getEventStatus(eventId);
  }


// 🚚 CREATE SHIPMENT
  @Post('shipment/:eventId')
  createShipment(@Param('eventId') eventId: string) {
    return this.service.createShipment(eventId);
  }

// 🚚 UPDATE STATUS
  @Post('shipment/:shipmentId/status/:status')
  updateShipment(
    @Param('shipmentId') shipmentId: string,
    @Param('status') status: string,
  ) {
    return this.service.updateShipmentStatus(shipmentId, status);
  }

// 📦 TRACK
  @Get('shipment/:eventId')
  track(@Param('eventId') eventId: string) {
    return this.service.trackShipment(eventId);
  }
} 
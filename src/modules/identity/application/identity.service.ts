import * as bcrypt from 'bcrypt';

export class IdentityService {
  private users: { id: string; email: string; password: string }[] = [];

  async register(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now().toString(),
      email,
      password: hash,
    };

    this.users.push(user);
    return { message: 'User registered', user };
  }

  async login(email: string, password: string) {
    const user = this.users.find(u => u.email === email);
    if (!user) return { message: 'User not found' };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { message: 'Invalid password' };

    return { message: 'Login success', user };
  }
}
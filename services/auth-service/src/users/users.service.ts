import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('🔍 [UsersService] Creating user with data:', createUserDto);
    
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      console.log('❌ [UsersService] User already exists:', existingUser.email);
      throw new ConflictException('User with this email already exists');
    }

    console.log('✅ [UsersService] No existing user found, proceeding with creation');

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    console.log('✅ [UsersService] Password hashed successfully');

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    console.log('🔍 [UsersService] User entity created:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status
    });

    console.log('💾 [UsersService] About to save user to database...');
    const savedUser = await this.usersRepository.save(user);
    console.log('✅ [UsersService] User saved to database:', {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      status: savedUser.status,
      createdAt: savedUser.createdAt
    });

    // Verify the user was actually saved by querying it back
    const verifyUser = await this.usersRepository.findOne({
      where: { id: savedUser.id }
    });
    console.log('🔍 [UsersService] Verification query result:', verifyUser ? 'User found in DB' : 'User NOT found in DB');

    // Check if savedUser has an ID
    if (!savedUser.id) {
      console.error('❌ [UsersService] Saved user has no ID!');
      throw new Error('Failed to save user - no ID returned');
    }

    // Return user without password
    const { password, ...result } = savedUser;
    console.log('🔍 [UsersService] Returning user result:', {
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName
    });
    return result as User;
  }

  async findAll(): Promise<User[]> {
    console.log('🔍 [UsersService] Finding all users...');
    const users = await this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'status', 'tenantId', 'lastLogin', 'createdAt', 'updatedAt'],
    });
    console.log('✅ [UsersService] Found users count:', users.length);
    return users;
  }

  async findOne(id: string): Promise<User> {
    console.log('🔍 [UsersService] Finding user by ID:', id);
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'status', 'tenantId', 'lastLogin', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      console.log('❌ [UsersService] User not found with ID:', id);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    console.log('✅ [UsersService] User found:', user.email);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    console.log('🔍 [UsersService] Finding user by email:', email);
    const user = await this.usersRepository.findOne({ where: { email } });
    console.log('✅ [UsersService] User found by email:', user ? 'Yes' : 'No');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    console.log('🔍 [UsersService] Updating user:', id);
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    await this.usersRepository.update(id, updateUserDto);
    console.log('✅ [UsersService] User updated successfully');
    return this.findOne(id);
  }

  async updateLastLogin(id: string): Promise<void> {
    console.log('🔍 [UsersService] Updating last login for user:', id);
    await this.usersRepository.update(id, { lastLogin: new Date() });
    console.log('✅ [UsersService] Last login updated');
  }

  async remove(id: string): Promise<void> {
    console.log('🔍 [UsersService] Removing user:', id);
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    console.log('✅ [UsersService] User removed successfully');
  }

  async findByRole(role: UserRole): Promise<User[]> {
    console.log('🔍 [UsersService] Finding users by role:', role);
    const users = await this.usersRepository.find({
      where: { role },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'status', 'tenantId', 'lastLogin', 'createdAt', 'updatedAt'],
    });
    console.log('✅ [UsersService] Found users with role', role, ':', users.length);
    return users;
  }
}
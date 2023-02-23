import { SignUpDto, SignUpDtoSchema } from './dto/signUp.dto';
import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { LocalAuthGuard } from 'guards/local-auth.guard';
import { JoiValidationPipe } from 'pipes/joi-validate.pipe';
import { AuthService } from './auth.service';
import { LoginDtoSchema } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @UsePipes(new JoiValidationPipe(LoginDtoSchema))
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @Post('sign-up')
  @UsePipes(new JoiValidationPipe(SignUpDtoSchema))
  async register(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }
}

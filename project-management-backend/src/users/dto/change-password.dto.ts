import {
  IsString,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// কাস্টম ভ্যালিডেটর তৈরি করা যা দুটি ফিল্ড তুলনা করে
@ValidatorConstraint({ name: 'matchPassword', async: false })
export class MatchPassword implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    return 'New password and confirmation password do not match.';
  }
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;

  // --- নতুন: পাসওয়ার্ড কনফার্মেশন ---
  @IsString()
  @MinLength(6)
  @Validate(MatchPassword, ['newPassword']) // newPassword-এর সাথে ম্যাচ করে কিনা যাচাই করুন
  confirmNewPassword: string;
}


import UpdateProfileForm from '@/components/dashboard/forms/UpdateProfileForm';
import ChangePasswordForm from '@/components/dashboard/forms/ChangePasswordForm';
import TwoFactorAuthForm from '@/components/dashboard/forms/TwoFactorAuthForm';

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-8">
      <UpdateProfileForm />
      <ChangePasswordForm />
      <TwoFactorAuthForm />
    </div>
  );
}

import UpdateProfileForm from '@/components/dashboard/forms/UpdateProfileForm';
import ChangePasswordForm from '@/components/dashboard/forms/ChangePasswordForm';

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-8">
      <UpdateProfileForm />
      <ChangePasswordForm />
    </div>
  );
}

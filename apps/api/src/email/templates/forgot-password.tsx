import { Text } from "react-email";

import { Layout } from "./components/layout";

export interface ForgotPasswordEmailProps {
  name: string;
  otp: string;
}

export const ForgotPasswordEmail = ({ name, otp }: ForgotPasswordEmailProps) => {
  return (
    <Layout preview="Reset your password">
      <Text className="text-[14px] leading-normal text-text-main">Hi {name},</Text>
      <Text className="text-[14px] leading-normal text-text-main">
        We received a request to reset your password. Use this code to continue resetting your
        password.
      </Text>
      <Text className="text-[14px] leading-normal text-text-main">
        However if you did NOT request this password change, please ignore this email.
      </Text>
      <div className="my-4 rounded-lg bg-card py-4 [border:1px_solid_theme(colors.border-accent)]">
        <Text className="m-0 text-center text-[24px] font-bold tracking-[8px] text-primary">
          {otp}
        </Text>
      </div>
      <Text className="text-[12px] leading-normal text-text-muted">
        This code expires in 5 minutes.
      </Text>
    </Layout>
  );
};

ForgotPasswordEmail.PreviewProps = {
  name: "Shema",
  otp: "123456",
} satisfies ForgotPasswordEmailProps;

export default ForgotPasswordEmail;

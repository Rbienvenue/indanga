import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "react-email";

import type { ReactNode } from "react";

export interface LayoutProps {
  preview: string;
  children: ReactNode;
}

export function Layout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="DM Sans"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: "#0059c9",
                background: "#efeef1",
                card: "#ffffff",
                border: "#eeeeee",
                "border-accent": "#0059c9",
                "text-main": "#1a1a1a",
                "text-muted": "#706a7b",
              },
              fontFamily: {
                sans: ["'DM Sans'", "sans-serif"],
              },
            },
          },
        }}
      >
        <Body className="bg-background font-sans">
          <Preview>{preview}</Preview>
          <Container className="mx-auto my-[30px] max-w-[580px] bg-white">
            <Section className="p-[30px]">
              <Img
                width={80}
                height={80}
                src={`https://www.indanga.com/logo.png`}
                alt={"Indanga"}
                className="mx-auto"
              />
            </Section>
            <Section className="w-full">
              <Row>
                <Column className="w-[238px] [border-bottom:1px_solid_theme(colors.border)]" />
                <Column className="w-[102px] [border-bottom:1px_solid_theme(colors.primary)]" />
                <Column className="w-[238px] [border-bottom:1px_solid_theme(colors.border)]" />
              </Row>
            </Section>
            <Section className="px-5 pb-[10px] pt-[5px]">{children}</Section>
            <Section className="px-5 pb-6 pt-[5px]">
              <Text className="m-0 text-center text-[12px] text-text-muted">
                Need help? Reach out to us at{" "}
                <Link href="mailto:support@indanga.com" className="text-primary">
                  support@indanga.com
                </Link>
              </Text>
            </Section>
          </Container>
          <Section className="mx-auto max-w-[580px]">
            <Row>
              <Text className="text-center text-[#706a7b]">
                © {new Date().getFullYear()} Indanga, All Rights Reserved
                <br />
                Kigali, Rwanda
              </Text>
            </Row>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}

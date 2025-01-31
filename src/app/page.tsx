"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Container, Title, Text, Center } from "@mantine/core";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <Container size="md" py="xl">
      <Center style={{ minHeight: "60vh" }}>
        <div>
          <Title order={1} mb="md">
            Welcome to SKU Manager
          </Title>
          <Text size="lg" c="dimmed">
            Please log in to access your inventory management system.
          </Text>
        </div>
      </Center>
    </Container>
  );
}

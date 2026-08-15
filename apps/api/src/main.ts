import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./lib/env";
import morgan from "morgan";

async function main() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.use(morgan("dev"));
  app.enableCors({
    origin: [env.FRONTEND_URL],
    credentials: true,
  });
  app.setGlobalPrefix("/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(env.PORT);
}
main();

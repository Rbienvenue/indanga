import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function main() {
  const app = await NestFactory.create(AppModule, {
    bodyParser:false
  });
  await app.listen(process.env.PORT ?? 5000);
}
main();

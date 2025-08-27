// src/swagger.ts
import { Application } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dream Wallet API",
      version: "1.0.0",
      description: "API documentation for the Digital Wallet Management System",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local server",
      },
    ],
  },
  apis: ["./src/app/modules/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application) => {
 app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

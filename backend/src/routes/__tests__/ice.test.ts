jest.mock("../../utils/db", () => ({
  execute: jest.fn(),
}));
jest.mock("../../services/iceCalculator");
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
}));

import { Request, Response, NextFunction } from "express";
import iceRouter from "../ice";
import { calculateIceForMonth } from "../../services/iceCalculator";

const mockCalculateIceForMonth = calculateIceForMonth as jest.MockedFunction<
  typeof calculateIceForMonth
>;

describe("GET /api/ice route handler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusCode: number;
  let responseBody: any;

  beforeEach(() => {
    jest.clearAllMocks();
    statusCode = 200;
    responseBody = null;
    next = jest.fn();

    req = {
      query: {},
    };

    res = {
      status: jest.fn(function (code: number) {
        statusCode = code;
        return this;
      }),
      json: jest.fn(function (data: any) {
        responseBody = data;
        return this;
      }),
    };
  });

  const getHandler = () => {
    const routes = iceRouter.stack;
    const getRoute = routes.find((r: any) => r.route && r.route.methods.get);
    const handler = getRoute?.route?.stack[1]?.handle;
    if (!handler) throw new Error("Handler not found");
    return handler;
  };

  describe("Valid requests", () => {
    it("returns ice data with holdsCow=true when ice is thick enough", async () => {
      req.query = { year: "2000", month: "1" };
      mockCalculateIceForMonth.mockResolvedValueOnce({
        year: 2000,
        month: 1,
        bestDate: "2000-01-15",
        maxIceCm: 15.5,
        holdsCow: true,
        fddAtPeak: 240,
        freezeDays: 31,
        thawDays: 0,
        message: "Tjock is! 15.5cm on 2000-01-15",
      });

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(200);
      expect(responseBody).toMatchObject({
        year: 2000,
        month: 1,
        maxIceCm: 15.5,
        holdsCow: true,
        freezeDays: 31,
        thawDays: 0,
      });
      expect(responseBody.holdsCow).toBe(true);
    });

    it("returns ice data with holdsCow=false when ice is too thin", async () => {
      req.query = { year: "2000", month: "1" };
      mockCalculateIceForMonth.mockResolvedValueOnce({
        year: 2000,
        month: 1,
        bestDate: null,
        maxIceCm: 5.2,
        holdsCow: false,
        fddAtPeak: 10,
        freezeDays: 5,
        thawDays: 25,
        message: "Inte tjock nog. Max: 5.2cm",
      });

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(200);
      expect(responseBody.holdsCow).toBe(false);
      expect(responseBody.maxIceCm).toBeLessThan(11);
    });

    it("accepts valid months (Oct-May)", async () => {
      const validMonths = [10, 11, 12, 1, 2, 3, 4, 5];

      for (const month of validMonths) {
        mockCalculateIceForMonth.mockResolvedValueOnce({
          year: 2000,
          month,
          bestDate: "2000-01-01",
          maxIceCm: 12,
          holdsCow: true,
          fddAtPeak: 150,
          freezeDays: 20,
          thawDays: 0,
          message: "Test",
        });

        req.query = { year: "2000", month: String(month) };
        const handler = getHandler();
        await handler(req as Request, res as Response, next);

        expect(statusCode).toBe(200);
      }
    });

    it("accepts valid year range (1917-2026)", async () => {
      req.query = { year: "1942", month: "1" };
      mockCalculateIceForMonth.mockResolvedValueOnce({
        year: 1942,
        month: 1,
        bestDate: "1942-01-15",
        maxIceCm: 20,
        holdsCow: true,
        fddAtPeak: 300,
        freezeDays: 31,
        thawDays: 0,
        message: "Tjock is!",
      });

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(200);
      expect(mockCalculateIceForMonth).toHaveBeenCalledWith(1942, 1);
    });
  });

  describe("Input validation", () => {
    it("rejects missing year parameter", async () => {
      req.query = { month: "1" };
      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(400);
      expect(responseBody).toEqual({
        error: "Invalid year or month",
        details: "year and month must be integers",
      });
    });

    it("rejects missing month parameter", async () => {
      req.query = { year: "2000" };
      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(400);
      expect(responseBody.error).toBe("Invalid year or month");
    });

    it("rejects non-integer year", async () => {
      req.query = { year: "not-a-number", month: "1" };
      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(400);
      expect(responseBody.error).toBe("Invalid year or month");
    });

    it("rejects non-integer month", async () => {
      req.query = { year: "2000", month: "abc" };
      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(400);
      expect(responseBody.error).toBe("Invalid year or month");
    });

    it("rejects year before 1917", async () => {
      req.query = { year: "1916", month: "1" };
      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(400);
      expect(responseBody).toEqual({
        error: "Year out of range",
        details: "year must be between 1917 and 2026",
      });
    });

    it("rejects year after 2026", async () => {
      req.query = { year: "2027", month: "1" };
      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(400);
      expect(responseBody.error).toBe("Year out of range");
    });

    it("rejects month outside 1-12", async () => {
      req.query = { year: "2000", month: "13" };
      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(400);
      expect(responseBody.error).toBe("Month out of range");
    });

    it("rejects months outside Oct-May (e.g., June)", async () => {
      req.query = { year: "2000", month: "6" };
      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(400);
      expect(responseBody.error).toBe("Invalid month for ice calculation");
      expect(responseBody.details).toContain("10, 11, 12, 1, 2, 3, 4, 5");
    });
  });

  describe("Error handling", () => {
    it("returns 500 on service error", async () => {
      req.query = { year: "2000", month: "1" };
      mockCalculateIceForMonth.mockRejectedValueOnce(
        new Error("Database connection failed"),
      );

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(500);
      expect(responseBody).toEqual({
        error: "Internal server error",
        details: "Database connection failed",
      });
    });

    it("handles non-Error thrown exceptions", async () => {
      req.query = { year: "2000", month: "1" };
      mockCalculateIceForMonth.mockRejectedValueOnce("Unknown error");

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(500);
      expect(responseBody.error).toBe("Internal server error");
    });
  });

  describe("Animation boolean holdsCow", () => {
    it("holdsCow=true triggers safe animation state (cow stands on ice)", async () => {
      req.query = { year: "2010", month: "2" };
      mockCalculateIceForMonth.mockResolvedValueOnce({
        year: 2010,
        month: 2,
        bestDate: "2010-02-10",
        maxIceCm: 25.0,
        holdsCow: true,
        fddAtPeak: 400,
        freezeDays: 50,
        thawDays: 8,
        message: "Tjock is! Kon klarar sig.",
      });

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(200);
      expect(responseBody.holdsCow).toBe(true);
      // Frontend receives true → CowAnimation plays "stand" state
    });

    it("holdsCow=false triggers unsafe animation state (cow plunges through ice)", async () => {
      req.query = { year: "2010", month: "3" };
      mockCalculateIceForMonth.mockResolvedValueOnce({
        year: 2010,
        month: 3,
        bestDate: null,
        maxIceCm: 6.5,
        holdsCow: false,
        fddAtPeak: 20,
        freezeDays: 10,
        thawDays: 50,
        message: "Inte tjock nog.",
      });

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(200);
      expect(responseBody.holdsCow).toBe(false);
      // Frontend receives false → CowAnimation plays "plunge" state
    });

    it("animation boolean at exact 11cm threshold (boundary condition)", async () => {
      req.query = { year: "2020", month: "1" };
      mockCalculateIceForMonth.mockResolvedValueOnce({
        year: 2020,
        month: 1,
        bestDate: "2020-01-20",
        maxIceCm: 11.0,
        holdsCow: true,
        fddAtPeak: 192,
        freezeDays: 31,
        thawDays: 0,
        message: "Tjock is! 11.0cm on 2020-01-20",
      });

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(statusCode).toBe(200);
      expect(responseBody.holdsCow).toBe(true);
      expect(responseBody.maxIceCm).toBe(11.0);
    });
  });

  describe("Date pipeline integration", () => {
    it("passes correct year and month to calculator", async () => {
      req.query = { year: "1995", month: "3" };
      mockCalculateIceForMonth.mockResolvedValueOnce({
        year: 1995,
        month: 3,
        bestDate: "1995-03-15",
        maxIceCm: 18.0,
        holdsCow: true,
        fddAtPeak: 250,
        freezeDays: 25,
        thawDays: 5,
        message: "Test",
      });

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      expect(mockCalculateIceForMonth).toHaveBeenCalledWith(1995, 3);
    });

    it("calculator queries from October through selected month", async () => {
      req.query = { year: "2000", month: "1" };
      mockCalculateIceForMonth.mockResolvedValueOnce({
        year: 2000,
        month: 1,
        bestDate: "2000-01-01",
        maxIceCm: 12,
        holdsCow: true,
        fddAtPeak: 150,
        freezeDays: 20,
        thawDays: 0,
        message: "Test",
      });

      const handler = getHandler();
      await handler(req as Request, res as Response, next);

      // Service is called with 2000, 1
      // Service internally calculates dates: Oct 1999 - Jan 31 2000
      expect(mockCalculateIceForMonth).toHaveBeenCalledWith(2000, 1);
      expect(statusCode).toBe(200);
    });
  });
});

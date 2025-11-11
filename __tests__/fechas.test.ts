import { crearFechaLocal, fechaToString } from "@/utils/fechas";

describe("fechas utils", () => {
  describe("crearFechaLocal", () => {
    it("crea una fecha correctamente desde un string YYYY-MM-DD", () => {
      const fecha = crearFechaLocal("2024-01-15");
      expect(fecha.getFullYear()).toBe(2024);
      expect(fecha.getMonth()).toBe(0); // Enero es 0
      expect(fecha.getDate()).toBe(15);
      expect(fecha.getHours()).toBe(0);
      expect(fecha.getMinutes()).toBe(0);
      expect(fecha.getSeconds()).toBe(0);
    });

    it("resetea las horas a 0", () => {
      const fecha = crearFechaLocal("2024-12-31");
      expect(fecha.getHours()).toBe(0);
      expect(fecha.getMinutes()).toBe(0);
      expect(fecha.getSeconds()).toBe(0);
      expect(fecha.getMilliseconds()).toBe(0);
    });

    it("maneja correctamente los meses con un solo dígito", () => {
      const fecha = crearFechaLocal("2024-01-01");
      expect(fecha.getMonth()).toBe(0); // Enero
    });

    it("maneja correctamente los días con un solo dígito", () => {
      const fecha = crearFechaLocal("2024-01-05");
      expect(fecha.getDate()).toBe(5);
    });

    it("lanza error si el formato es inválido", () => {
      expect(() => crearFechaLocal("2024/01/15")).toThrow(
        "Formato de fecha inválido. Debe ser YYYY-MM-DD"
      );
      expect(() => crearFechaLocal("24-01-15")).toThrow(
        "Formato de fecha inválido. Debe ser YYYY-MM-DD"
      );
      expect(() => crearFechaLocal("2024-1-15")).toThrow(
        "Formato de fecha inválido. Debe ser YYYY-MM-DD"
      );
      expect(() => crearFechaLocal("")).toThrow(
        "Formato de fecha inválido. Debe ser YYYY-MM-DD"
      );
    });

    it("lanza error si la fecha es inválida", () => {
      expect(() => crearFechaLocal("2024-13-01")).toThrow("Fecha inválida");
      expect(() => crearFechaLocal("2024-02-30")).toThrow("Fecha inválida");
    });
  });

  describe("fechaToString", () => {
    it("convierte una fecha a string YYYY-MM-DD correctamente", () => {
      const fecha = new Date(2024, 0, 15); // 15 de enero de 2024
      fecha.setHours(0, 0, 0, 0);
      expect(fechaToString(fecha)).toBe("2024-01-15");
    });

    it("formatea correctamente meses y días con un solo dígito", () => {
      const fecha = new Date(2024, 0, 5); // 5 de enero de 2024
      fecha.setHours(0, 0, 0, 0);
      expect(fechaToString(fecha)).toBe("2024-01-05");
    });

    it("formatea correctamente meses y días con dos dígitos", () => {
      const fecha = new Date(2024, 11, 31); // 31 de diciembre de 2024
      fecha.setHours(0, 0, 0, 0);
      expect(fechaToString(fecha)).toBe("2024-12-31");
    });

    it("usa la zona horaria local", () => {
      const fecha = new Date(2024, 5, 15, 14, 30, 0); // 15 de junio de 2024, 14:30
      const resultado = fechaToString(fecha);
      // Debe devolver la fecha en zona horaria local, no UTC
      expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(resultado).toBe("2024-06-15");
    });

    it("lanza error si la fecha es inválida", () => {
      const fechaInvalida = new Date("invalid");
      expect(() => fechaToString(fechaInvalida)).toThrow("Fecha inválida");
    });

    it("es idempotente con crearFechaLocal", () => {
      const fechaStr = "2024-03-20";
      const fecha = crearFechaLocal(fechaStr);
      const resultado = fechaToString(fecha);
      expect(resultado).toBe(fechaStr);
    });
  });
});


import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegistroCortesForm from "@/components/RegistroCortesForm";

// Mock fetch para barberos
beforeAll(() => {
  global.fetch = jest.fn().mockImplementation((url) => {
    if (url === "/api/barberos") {
      return Promise.resolve({ json: () => Promise.resolve(["Joaco", "Elias"]) });
    }
    return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
  });
});

describe("RegistroCortesForm - Cortes Especiales", () => {
  it("permite agregar un corte especial con monto", async () => {
    const onContinue = jest.fn();
    
    render(<RegistroCortesForm onContinue={onContinue} />);

    // Seleccionar barbero
    const barberoSelect = await screen.findByRole("combobox", { name: /barbero/i });
    fireEvent.change(barberoSelect, { target: { value: "Joaco" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    // Paso 2: formulario de servicios
    await screen.findByText(/Servicios realizados/i);

    // Buscar botón para agregar corte especial
    const btnAgregarEspecial = screen.getByRole("button", { name: /agregar corte especial/i });
    fireEvent.click(btnAgregarEspecial);

    // Debe aparecer un input para el monto
    const montoInput = screen.getByLabelText(/monto/i);
    fireEvent.change(montoInput, { target: { value: "5000" } });
    
    // Confirmar agregado
    const btnConfirmar = screen.getByRole("button", { name: /confirmar/i });
    fireEvent.click(btnConfirmar);

    // Verificar que aparece en la lista (debería haber un li con $5.000)
    const cortesLista = screen.getByRole("list");
    expect(cortesLista).toHaveTextContent("$5.000");

    // Ingresar servicios básicos para tener un total
    const efectivoInputs = screen.getAllByLabelText(/Efectivo/i);
    fireEvent.change(efectivoInputs[0], { target: { value: "2" } }); // 2 cortes efectivo = 22000

    // Verificar que el total incluye el corte especial
    // Total: 22000 + 5000 = 27000
    expect(screen.getByText(/Total: \$27\.000/)).toBeInTheDocument();
  });

  it("permite agregar múltiples cortes especiales", async () => {
    const onContinue = jest.fn();
    
    render(<RegistroCortesForm onContinue={onContinue} />);

    const barberoSelect = await screen.findByRole("combobox", { name: /barbero/i });
    fireEvent.change(barberoSelect, { target: { value: "Joaco" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await screen.findByText(/Servicios realizados/i);

    // Agregar primer corte especial: 5000
    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: "5000" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    // Agregar segundo corte especial: 8000
    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: "8000" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    // Agregar tercer corte especial: 3000
    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: "3000" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    // Verificar que los 3 aparecen
    expect(screen.getByText(/\$5\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$8\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$3\.000/)).toBeInTheDocument();

    // Total: 0 (servicios) + 16000 (especiales) = 16000
    expect(screen.getByText(/Total: \$16\.000/)).toBeInTheDocument();
  });

  it("permite eliminar un corte especial", async () => {
    const onContinue = jest.fn();
    
    render(<RegistroCortesForm onContinue={onContinue} />);

    const barberoSelect = await screen.findByRole("combobox", { name: /barbero/i });
    fireEvent.change(barberoSelect, { target: { value: "Joaco" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await screen.findByText(/Servicios realizados/i);

    // Agregar 2 cortes especiales
    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: "5000" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: "8000" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    // Verificar que ambos están
    expect(screen.getByText(/\$5\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$8\.000/)).toBeInTheDocument();

    // Eliminar el primero (5000)
    const botonesEliminar = screen.getAllByRole("button", { name: /eliminar/i });
    fireEvent.click(botonesEliminar[0]);

    // Verificar que solo queda el de 8000
    const cortesLista = screen.getByRole("list");
    expect(cortesLista).not.toHaveTextContent("$5.000");
    expect(cortesLista).toHaveTextContent("$8.000");

    // Total: 0 + 8000 = 8000
    expect(screen.getByText(/Total: \$8\.000/)).toBeInTheDocument();
  });

  it("envía cortesEspeciales en el payload", async () => {
    const onContinue = jest.fn();
    
    render(<RegistroCortesForm onContinue={onContinue} />);

    const barberoSelect = await screen.findByRole("combobox", { name: /barbero/i });
    fireEvent.change(barberoSelect, { target: { value: "Joaco" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await screen.findByText(/Servicios realizados/i);

    // Agregar servicios normales
    const efectivoInputs = screen.getAllByLabelText(/Efectivo/i);
    fireEvent.change(efectivoInputs[0], { target: { value: "3" } });

    // Agregar 2 cortes especiales
    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: "5000" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: "7000" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /guardar registros/i }));

    await waitFor(() => expect(onContinue).toHaveBeenCalled());

    const payload = onContinue.mock.calls[0][0];
    expect(payload.cortesEspeciales).toEqual([
      { monto: 5000 },
      { monto: 7000 },
    ]);
  });

  it("maneja monto 0 o vacío en corte especial", async () => {
    const onContinue = jest.fn();
    
    render(<RegistroCortesForm onContinue={onContinue} />);

    const barberoSelect = await screen.findByRole("combobox", { name: /barbero/i });
    fireEvent.change(barberoSelect, { target: { value: "Joaco" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await screen.findByText(/Servicios realizados/i);

    // Intentar agregar corte con monto 0
    fireEvent.click(screen.getByRole("button", { name: /agregar corte especial/i }));
    const montoInput = screen.getByLabelText(/monto/i);
    fireEvent.change(montoInput, { target: { value: "0" } });
    
    const btnConfirmar = screen.getByRole("button", { name: /confirmar/i });
    
    // El botón debería estar deshabilitado o no hacer nada
    expect(btnConfirmar).toBeDisabled();
  });

  it("el total sin cortes especiales sigue funcionando", async () => {
    const onContinue = jest.fn();
    
    render(<RegistroCortesForm onContinue={onContinue} />);

    const barberoSelect = await screen.findByRole("combobox", { name: /barbero/i });
    fireEvent.change(barberoSelect, { target: { value: "Joaco" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await screen.findByText(/Servicios realizados/i);

    // Solo servicios normales
    const efectivoInputs = screen.getAllByLabelText(/Efectivo/i);
    fireEvent.change(efectivoInputs[0], { target: { value: "5" } }); // 5 * 11000 = 55000

    // Verificar total sin especiales
    expect(screen.getByText(/Total: \$55\.000/)).toBeInTheDocument();

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /guardar registros/i }));

    await waitFor(() => expect(onContinue).toHaveBeenCalled());

    const payload = onContinue.mock.calls[0][0];
    
    // cortesEspeciales debe ser array vacío o no existir
    expect(payload.cortesEspeciales || []).toEqual([]);
  });
});

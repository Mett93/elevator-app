import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ElevatorControlSystem from "./ElevatorControlSystem";
import { ELEVATOR_COUNT } from "../constants/ElevatorControlSystem";

describe("ElevatorControlSystem (very simple)", () => {
  test("renders the main header", () => {
    render(<ElevatorControlSystem />);
    expect(
      screen.getByRole("heading", { name: "Elevator Control System" })
    ).toBeInTheDocument();
  });

  test("renders correct number of elevator status items", () => {
    render(<ElevatorControlSystem />);
    const statusItems = screen.getAllByText(/Elevator \d+/);
    expect(statusItems).toHaveLength(ELEVATOR_COUNT);
  });

  test("shows Pending Calls (0) initially", () => {
    render(<ElevatorControlSystem />);
    expect(screen.getByText(/Pending Calls\s*\(0\)/)).toBeInTheDocument();
  });

  test("initially all elevators are IDLE", () => {
    render(<ElevatorControlSystem />);
    const idleStatuses = screen.getAllByText("IDLE");
    expect(idleStatuses).toHaveLength(ELEVATOR_COUNT);
  });

  test("start/stop buttons toggle and emit logs", async () => {
    render(<ElevatorControlSystem />);

    const startBtn = screen.getByRole("button", { name: "Start System" });
    const stopBtn = screen.getByRole("button", { name: "Stop System" });

    expect(startBtn).not.toBeDisabled();
    expect(stopBtn).toBeDisabled();

    fireEvent.click(startBtn);
    await waitFor(() => {
      expect(startBtn).toBeDisabled();
      expect(stopBtn).not.toBeDisabled();
    });
    expect(
      screen.getByText("Elevator control system started")
    ).toBeInTheDocument();

    fireEvent.click(stopBtn);
    await waitFor(() => {
      expect(startBtn).not.toBeDisabled();
      expect(stopBtn).toBeDisabled();
    });
    expect(
      screen.getByText("Elevator control system stopped")
    ).toBeInTheDocument();
  });

  test("clicking Stop without starting emits no stop log", () => {
    render(<ElevatorControlSystem />);
    const stopBtn = screen.getByRole("button", { name: "Stop System" });
    fireEvent.click(stopBtn);
    expect(
      screen.queryByText("Elevator control system stopped")
    ).not.toBeInTheDocument();
  });

  test("start logs only once on multiple start clicks", async () => {
    render(<ElevatorControlSystem />);
    const startBtn = screen.getByRole("button", { name: "Start System" });

    fireEvent.click(startBtn);
    await waitFor(() => expect(startBtn).toBeDisabled());
    let startLogs = screen.getAllByText("Elevator control system started");
    expect(startLogs).toHaveLength(1);

    fireEvent.click(startBtn);
    startLogs = screen.getAllByText("Elevator control system started");
    expect(startLogs).toHaveLength(1);
  });

  test("stop logs only once on multiple stop clicks", async () => {
    render(<ElevatorControlSystem />);
    const startBtn = screen.getByRole("button", { name: "Start System" });
    const stopBtn = screen.getByRole("button", { name: "Stop System" });

    fireEvent.click(startBtn);
    await waitFor(() => expect(startBtn).toBeDisabled());
    fireEvent.click(stopBtn);
    await waitFor(() => expect(stopBtn).toBeDisabled());

    let stopLogs = screen.getAllByText("Elevator control system stopped");
    expect(stopLogs).toHaveLength(1);

    fireEvent.click(stopBtn);
    stopLogs = screen.getAllByText("Elevator control system stopped");
    expect(stopLogs).toHaveLength(1);
  });
});

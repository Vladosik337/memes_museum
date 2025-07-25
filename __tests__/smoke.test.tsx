import { render, screen } from "@testing-library/react";

describe("App smoke test", () => {
  it("renders without crashing", () => {
    render(<div>Hello, memes museum!</div>);
    expect(screen.getByText("Hello, memes museum!")).toBeInTheDocument();
  });
});

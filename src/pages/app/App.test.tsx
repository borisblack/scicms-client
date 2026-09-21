import React from "react"
import {render, screen} from "@testing-library/react"
import {Provider} from "react-redux"
import {MemoryRouter, Route, Routes} from "react-router-dom"
import {store} from "src/store"
import App from "./App"

test("redirects unauthenticated users to login", () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="*" element={<App />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )

  expect(screen.getByText(/login page/i)).toBeInTheDocument()
})

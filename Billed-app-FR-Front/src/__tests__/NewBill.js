/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      //initialisation
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      //html
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      //route
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      //récupération et test
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).not.toBeNull();
      expect(mailIcon.classList.contains('active-icon')).toBe(true);
    })
  })
})

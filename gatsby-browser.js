/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
import React from "react"
import Layout from "./src/components/layout"
import {isLoggedIn} from './src/services/auth'
import LogIn from './src/components/login'

export const wrapPageElement = ({ element, props }) => {
  // props provide same data to Layout as Page element will get
  // including location, data, etc - you don't need to pass it

  return isLoggedIn() ? <Layout {...props}>{element}</Layout> : <LogIn/>
}

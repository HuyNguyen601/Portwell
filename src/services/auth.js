export const isBrowser = () => typeof window !== "undefined"

export const getUser = () =>
  isBrowser() && window.localStorage.getItem("gatsbyUser")
    ? JSON.parse(window.localStorage.getItem("gatsbyUser"))
    : isBrowser() && window.sessionStorage.getItem("gatsbyUser")
    ? JSON.parse(window.sessionStorage.getItem("gatsbyUser"))
    : {}

const setUser = user =>
  window.localStorage.setItem("gatsbyUser", JSON.stringify(user))

const setTempUser = user=>
  window.sessionStorage.setItem("gatsbyUser",JSON.stringify(user))

export const handleLogin = ({ username, password, remember }) => {
  if (username === `huy` && password === `123` ) {
    const user = {
      username: `huy`,
      name: `Huy Nguyen`,
      email: `huygian@portwell.com`,
    }
    if(remember){
      setUser(user)
    }
    else {
      setTempUser(user)
    }
    return true
  }

  return false
}

export const isLoggedIn = () => {
  const user = getUser()

  return !!user.username
}

export const logout = callback => {
  if(isBrowser()){
    window.localStorage.removeItem('gatsbyUser')
    window.sessionStorage.removeItem('gatsbyUser')
  }
  callback()
}

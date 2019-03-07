import axios from 'axios'
import qs from 'qs'

const checkUser = async (username,password) =>{
  const url = 'http://192.168.0.18:8080/apt/api/sfc/2.3/api_sfc_login.php'
  try {
    const response = await axios.post(url, qs.stringify({
      id: 'developer',
      jsonMeta: JSON.stringify({"act": "checkUserByEmail"}),
      jsonData: JSON.stringify({"search_text": username, "passwordstr": password})
    }))
    return response
  } catch (error) {
    console.log(error)
  }
}

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

export const handleLogin = ({ username, password, location, remember }) => {
  const email = username.includes('@portwell.com') ? username : username+'@portwell.com'
  return checkUser(email,password).then(response=>{
    const data = response.data
    if(data.records >0){
      const user = {
        user_name: data.record[0].username,
        user_id: data.record[0]._id,
        email: data.record[0].email,
        location: location,
      }
      if(remember){
        setUser(user)
      }
      else {
        setTempUser(user)
      }
      return true
    }
    else return false
  })
}

export const isLoggedIn = () => {
  const user = getUser()

  return !!user.user_name
}

export const logout = callback => {
  if(isBrowser()){
    window.localStorage.removeItem('gatsbyUser')
    window.sessionStorage.removeItem('gatsbyUser')
  }
  callback()
}

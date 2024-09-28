import z from "zod"

export const signupschema=z.object({
    email:z.string().email(),
    name:z.string().min(6),
    password:z.string().min(7)
  
  })
  
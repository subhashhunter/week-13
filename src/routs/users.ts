import { Hono } from "hono";

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {   sign } from 'hono/jwt';
export const userRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string;
        JWT_SECRET:string

    }
}
>()


userRouter.post('/signup',async(c)=>{
    const prisma=new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL,
     
    }).$extends(withAccelerate());
    const body= await c.req.json();
    const user=  await prisma.user.create({
      data:{
        email:body.email,
        name:body.name,
        password:body.password
      }
    })
  const token=await sign({id:user.id}, c.env.JWT_SECRET)
    return c.json({
      jwt:token
  
    })
  })
  
  userRouter.post('/signin',async(c)=>{
    const prisma=new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  const body=await c.req.json();
    const user=await prisma.user.findFirst({
      where:{
        email:body.email,
        name:body.name,
        password:body.password
      }
    })
    if(!user)
    {
     return c.json({
        msg:"user not found"
      })
    }
    const token=await sign({user},c.env.JWT_SECRET)
   return c.json({
      jwt:token
    })
    
  })
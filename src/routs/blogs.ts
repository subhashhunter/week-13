import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {   verify } from 'hono/jwt';
 export const blogRouter=new Hono<{
        Bindings:{
            DATABASE_URL:string;
            JWT_SECRET:string
        }
 }>()

 blogRouter.use('/*',async(c,next)=>{
    const authHeader=c.req.header("authorization")|| ""
    const user= await verify(authHeader,c.env.JWT_SECRET)
    if(user){
        //@ts-ignore
        c.set("userId",user.id)
      await  next()
    }
    else{
         c.status(411);
         return c.json({
            msg:"you sre not logged in"
         })
    }
    

 })

 blogRouter.post('/create',async(c)=>{
    const body=await c.req.json()
    //@ts-ignore
    const authorId=c.get("userId")
    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
       
      }).$extends(withAccelerate());
     const post= await prisma.post.create({
        data:{
            title:body.title,
            content:body.content,
            authorId:String(authorId)

        }
      })

    return c.json({
        id:post.id
    })
  })
  blogRouter.put('/update',async(c)=>{
    const body=await c.req.json();
    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
       
      }).$extends(withAccelerate());
    const post=await prisma.post.update({
        where:{
            id:body.id
        },
        data:{
            title:body.title,
            content:body.title
        }
    })


    return c.json({
        id:post.id
    })
  })
  blogRouter.get('/bulk',async(c)=>{
    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
       
      }).$extends(withAccelerate());
      const post=await prisma.post.findMany({})
    return c.json({
        post
    })
  })
  blogRouter.get('/:id',async(c)=>{
 const id=c.req.param("id")
    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
       
      }).$extends(withAccelerate());
      try{
        const post= await prisma.post.findFirst({
            where:{
                id:id
            }
          })
    
    
        return c.json({
            post
        })
      }
      catch(e){
        c.status(411)
        return c.json({
            msg:"error occured"
        })

      }
  
  })
  
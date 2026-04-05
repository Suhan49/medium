// import { Hono } from 'hono'
// import { PrismaClient } from '@prisma/client/edge'
// import { withAccelerate } from '@prisma/extension-accelerate'
// import { sign } from "hono/jwt"
//  const app = new Hono<{
//   Bindings : {
//     DATABASE_URL : string
//       JWT_SECRET: string
//    }
//  }>()


// // const app = new Hono()


// app.post('/api/v1/signup', async (c) => {
//  const prisma = new PrismaClient().$extends(withAccelerate())

//   const body = await c.req.json();
//   const user = await prisma.user.create({
//     data : {
//       email : body.email,
//       password : body.password,
//     },
//   })
 
//   const token = await sign({ id:user.id }, c.env.JWT_SECRET)
//   return c.json({
//     jwt : token
//   })
// })

// app.post('/api/v1/signin', (c) => {
//   return c.text('Hello Hono!')
// })

// app.post('/api/v1/blog', (c) => {
//   return c.text('Hello Hono!')
// })

// app.put('/api/v1/blog', (c) => {
//   return c.text('Hello Hono!')
// })

// app.get('/api/v1/blog/:id', (c) => {
//   return c.text('Hello Hono!')
// })


// export default app






import { Hono } from 'hono'
import { userRouter } from './routes/user';
// import { blogRouter } from './routes/blog';
import { cors } from 'hono/cors'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>();
app.use('/*', cors())
app.route("/api/v1/user", userRouter);
// app.route("/api/v1/blog", blogRouter);

export default app

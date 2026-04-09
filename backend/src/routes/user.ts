// import { Hono } from "hono";
// import { PrismaClient } from '@prisma/client/edge'
// import { withAccelerate } from '@prisma/extension-accelerate'
// import { PrismaNeon } from '@prisma/adapter-neon'
// import { sign } from 'hono/jwt'
// import { signupInput, signinInput } from "@100xdevs/medium-common";

// export const userRouter = new Hono<{
//     Bindings: {
//         DATABASE_URL: string;
//         JWT_SECRET: string;
//     }
// }>();

// userRouter.post('/signup', async (c) => {
//     const body = await c.req.json();
//     const { success } = signupInput.safeParse(body);
//     if (!success) {
//         c.status(403);
//         return c.json({
//             message: "Inputs not correct"
//         })
//     }
//     // const prisma = new PrismaClient({
//     //   datasourceUrl: c.env.DATABASE_URL,
//     // }).$extends(withAccelerate())

// //     const prisma = new PrismaClient().$extends(
// //   withAccelerate({
// //     connectionString: c.env.DATABASE_URL,
// //   })
// // );

// // const adapter = new PrismaNeon({
// //   connectionString: c.env.DATABASE_URL,
// // })

// // const prisma = new PrismaClient({
// //   adapter,
// // }).$extends(withAccelerate())


// const prisma = new PrismaClient().$extends(withAccelerate());
//     try {
//       const user = await prisma.user.create({
//         data: {
//            username: body.username,
//           password: body.password,
//         }
//       })
//       const jwt = await sign({
//         id: user.id
//       }, c.env.JWT_SECRET);
  
//       return c.text(jwt)
//     } catch(e) {
//       console.log(e);
//       c.status(403);
//       return c.text('Invalid')
//     }
//   })
  
  
//   userRouter.post('/signin', async (c) => {
//     const body = await c.req.json();
//     const { success } = signinInput.safeParse(body);
//     if (!success) {
//         c.status(403);
//         return c.json({
//             message: "Inputs not correct"
//         })
//     }

//     // const prisma = new PrismaClient({
//     //   datasourceUrl: c.env.DATABASE_URL,
//     // }).$extends(withAccelerate())

// const prisma = new PrismaClient().$extends(withAccelerate());
  
//     try {
//       const user = await prisma.user.findFirst({
//         where: {
//           username: body.username,
//           password: body.password,
//         }
//       })
//       if (!user) {
//         c.status(403);
//         return c.json({
//           message: "Incorrect creds"
//         })
//       }
//       const jwt = await sign({
//         id: user.id
//       }, c.env.JWT_SECRET);
  
//       return c.text(jwt)
//     } catch(e) {
//       console.log(e);
//       c.status(403);
//       return c.text('Invalid')
//     }
//   })





import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";

import { sign,verify} from "hono/jwt";
//import { signupInput, signinInput } from "@100xdevs/medium-common";
import { PrismaNeon } from "@prisma/adapter-neon";
import { signupInput,signinInput } from "@suhanpatil/medium-token";

// import { z } from "zod";


// const signupInput = z.object({
//   username: z.string().min(3),
//   password: z.string().min(6),
//   name: z.string().optional(),
// });


export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();


userRouter.use('/api/v1/blog/*', async(c,next) => {
  const header = c.req.header("authorization") || "";
  const token = header.split(" ")[1]
// @ts-ignore
  const response = await verify(token,c.env.JWT_SECRET)
  console.log("AUTH HEADER:", c.req.header("authorization"));
  if(response.id){
    next()
  } else {
    c.status(403)
    return c.json({ error : "unauthorized"})
  }
})

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();

  // const { success } = signupInput.safeParse(body);
  // if (!success) {
  //   c.status(403);
  //   return c.json({ message: "Inputs not correct" });
  // }

const result = signupInput.safeParse(body);

if (!result.success) {
  console.log(result.error); 

  c.status(403);
  return c.json({
    message: "Inputs not correct"
  });
}


  // const prisma = new PrismaClient().$extends(withAccelerate());
const adapter = new PrismaNeon({
  connectionString: c.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
        name: body.name,
      },
    });

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json({
      jwt : token
    });
  } catch (e) {
    console.log("DB ERROR:", e);
    c.status(500);
    return c.text("Database error");
  }
});



// const signinInput = z.object({
//   username: z.string().min(3),
//   password: z.string().min(6)
// });

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();

  const { success } = signinInput.safeParse(body);
  if (!success) {
    c.status(403);
    return c.json({ message: "Inputs not correct" });
  }

const result = signinInput.safeParse(body);

if (!result.success) {
  console.log(result.error); 

  c.status(403);
  return c.json({
    message: "Inputs not correct"
  });
}


  // const prisma = new PrismaClient().$extends(withAccelerate());
const adapter = new PrismaNeon({
  connectionString: c.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: body.username,
        password: body.password,
      },
    });

    if (!user) {
      c.status(403);
      return c.json({ message: "Incorrect creds" });
    }

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json({
      jwt : token
    });
  } catch (e) {
    console.log("DB ERROR:", e);
    c.status(500);
    return c.text("Database error");
  }
});
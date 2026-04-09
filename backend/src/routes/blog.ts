import { Hono } from "hono";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client/edge";
import { verify } from "hono/jwt";
import { createBlogInput,updateBlogInput } from "@suhanpatil/medium-token";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables : {
    userId : number;
  }
}>();

blogRouter.use("/*", async (c,next) => {
    const authHeader = c.req.header("authorization") || "";
    // const token = authHeader.split(" ")[1];
        const user = await verify(authHeader, c.env.JWT_SECRET, "HS256") as { id: number };
    try {
        if(user){
         c.set("userId", user.id);
         await next();
    } else {
        c.status(403);
        return c.json({
            message : "You are not logged in "
        })
    }
    } catch(e) {
        c.status(403);
        return c.json({
            message:"Error while verifying token"
        });
    }
    
})

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
      if (!success) {
        c.status(403);
        return c.json({ message: "Inputs not correct" });
      }
    const authorId = c.get("userId");
    const adapter = new PrismaNeon({
      connectionString: c.env.DATABASE_URL,
    });
    
    const prisma = new PrismaClient({ adapter });

    const blog = await prisma.blog.create({
        data : {
            title: body.title,
            content : body.content,
            authorId : authorId
        }
    })
    return c.json({
        id : blog.id
    })
})

blogRouter.put('/', async (c) => {
   const body = await c.req.json();
   const { success } = updateBlogInput.safeParse(body);
      if (!success) {
        c.status(403);
        return c.json({ message: "Inputs not correct" });
      }
    const adapter = new PrismaNeon({
      connectionString: c.env.DATABASE_URL,
    });
    
    const prisma = new PrismaClient({ adapter });

    const blog = await prisma.blog.update({
        where : {
            id: body.id
        },
        data : {
            title: body.title,
            content : body.content
        }
    })
    return c.json({
        id : blog.id
    })
})

blogRouter.get('/bulk', async (c) => {
    const adapter = new PrismaNeon({
      connectionString: c.env.DATABASE_URL,
    });
    
    const prisma = new PrismaClient({ adapter });

    //  const blogs = await prisma.blog.findMany();

    //  return c.json({
    //     blogs
    //  })


     const blogs = await prisma.blog.findMany({
        include: {
            author: true
        }
    });

    return c.json({ blogs });
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const adapter = new PrismaNeon({
      connectionString: c.env.DATABASE_URL,
    });
    
    const prisma = new PrismaClient({ adapter });

    try {
        const blog = await prisma.blog.findFirst({
        where:{
            id: Number(id)
        },
    })
    return c.json({
        blog
    })
    } catch(e) {
        c.status(403);
        return c.json({
            message:"Error while fetching blog post"
        });
    }
})


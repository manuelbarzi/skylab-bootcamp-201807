import { config } from "dotenv";
import { Router, Request, Response } from "express";
import bodyParser from "body-parser";
import logic from "../logic";
import LogicError from "../logic/error/logic-error";
import jwt from "jsonwebtoken";
import { UserModelInterface } from "../models/user";
const multer = require("multer");
import passport from "passport";

config();

const router: Router = Router();

const jsonBodyParser = bodyParser.json();

const upload = multer();

const validateJwt = passport.authenticate("jwt", { session: false });

router.post("/register", jsonBodyParser, (req: Request, res: Response) => {
  const { body: { username, email, password } } = req;

  logic.user.register(username, email, password)
    .then(() => res.status(201).json({ message: "user registered" }))
    .catch((err: Error) => {
      const { message } = err;

      res.status(err instanceof LogicError ? 400 : 500).json({ message });
    });
});

router.post(
  "/auth",
  [jsonBodyParser, passport.authenticate("local", { session: false })],
  (req: Request, res: Response) => {
    const { body: { username, password } } = req;

    logic.user.authenticate(username, password)
      .then(() => {
        const { JWT_SECRET, JWT_EXP } = process.env;

        const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: JWT_EXP });

        res.json({ message: "user authenticated", token });
      })
      .catch((err: Error) => {
        const { message } = err;

        res.status(err instanceof LogicError ? 401 : 500).json({ message });
      });
  });

router.get("/users/:username", validateJwt, (req: Request, res: Response) => {
  const { params: { username } } = req;

  logic.user.retrieve(username)
    .then((user: UserModelInterface) => res.json(user))
    .catch((err: Error) => {
      const { message } = err;
      return res.status(err instanceof LogicError ? 400 : 500).json({ message });
    });
});

router.put("/users/:username", [validateJwt, jsonBodyParser], (req: Request, res: Response) => {
  const { params: { username } } = req;
  const { body: { email, name, website, phoneNumber, gender, biography, privateAccount } } = req;

  logic.user.update(username, email, name, website, phoneNumber, gender, biography, privateAccount)
    .then(() => res.json({ message: "user updated" }))
    .catch(err => {
      const { message } = err;

      res.status(err instanceof LogicError ? 400 : 500).json({ message });
    });
});

router.patch("/users/:username/update-password", [validateJwt, jsonBodyParser], (req: Request, res: Response) => {
  const { params: { username }, body: { password, newPassword } } = req;

  logic.user.updatePassword(username, password, newPassword)
    .then(() => res.json({ message: "user password updated" }))
    .catch(err => {
      const { message } = err;

      res.status(err instanceof LogicError ? 400 : 500).json({ message });
    });
});

router.patch(
  "/users/:username/update-avatar",
  [validateJwt, upload.single("avatar")],
  (req: Request | any, res: Response) => {
    const { params: { username }, file } = req;

    if (file) {
      logic.user.updateAvatar(username, file.originalname, file.buffer)
        .then(() => res.json({ message: "user avatar updated" }))
        .catch((err: any) => {
          const { message } = err;

          res.status(err instanceof LogicError ? 400 : 500).json({ message });
        });
    } else {
      res.status(400).json({ message: "no image received" });
    }
  });

router.patch("/users/:username/disable", [validateJwt, jsonBodyParser], (req: Request, res: Response) => {
  const { params: { username } } = req;

  logic.user.disable(username)
    .then(() => res.json({ message: "user disabled" }))
    .catch(err => {
      const { message } = err;

      res.status(err instanceof LogicError ? 400 : 500).json({ message });
    });
});

export default router;

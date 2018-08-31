import { FollowerInterface } from "../follower";

/**
 *
 *
 * @interface UserInterface
 */
interface UserInterface {
  username: string;
  password: string;
  name: string;
  email: string;
  website: string;
  phoneNumber: string;
  gender: string;
  biography: string;
  avatar: string;
  privateAccount: boolean;
  lastLogin: Date;
  enable: boolean;
  createdAt: Date;
  updatedAt: Date;
  followers: FollowerInterface[];
}

export default UserInterface;

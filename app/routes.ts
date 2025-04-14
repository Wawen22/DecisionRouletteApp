import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth/login", "routes/auth/login.tsx"),
  route("auth/register", "routes/auth/register.tsx"),
  route("auth/reset-password", "routes/auth/reset-password.tsx"),
  route("wheels", "routes/wheels/index.tsx"),
  route("wheels/new", "routes/wheels/new.tsx"),
  route("wheels/:wheelId", "routes/wheels/$wheelId.tsx"),
  route("wheels/edit/:wheelId", "routes/wheels/edit/$wheelId.tsx"),
  route("profile", "routes/profile/index.tsx"),
  route("groups", "routes/groups/index.tsx"),
] satisfies RouteConfig;

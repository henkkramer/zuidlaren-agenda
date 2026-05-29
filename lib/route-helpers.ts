import { NextResponse } from "next/server";

export type RouteAccessDenied = {
  ok: false;
  error: string;
  status: number;
};

export function accessDeniedResponse(access: RouteAccessDenied) {
  return NextResponse.json({ error: access.error }, { status: access.status });
}

export function badRequestResponse(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
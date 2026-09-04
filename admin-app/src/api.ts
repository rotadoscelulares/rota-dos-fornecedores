export interface Usuario {
  id: number;
  nomeCompleto: string;
  endereco: string;
  celular: string;
  email: string;
  isAdmin: boolean;
  status: "ativo" | "suspenso";
  ultimoLoginEm: string | null;
  ultimoLoginIp: string | null;
  criadoEm: string;
}

interface ApiResponse {
  ok: boolean;
  erro?: string;
  erros?: string[];
  [key: string]: unknown;
}

async function api<T extends ApiResponse>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: Partial<T> = {};
  try {
    data = await res.json();
  } catch {
    // resposta sem corpo
  }
  if (!res.ok && !data.erro && !data.erros) {
    (data as ApiResponse).erro = "Não foi possível completar a solicitação.";
  }
  return { ok: res.ok, ...data } as T;
}

export const AUTH = {
  me: () => api<ApiResponse & { usuario?: Usuario }>("GET", "/api/auth/me"),
  logout: () => api("POST", "/api/auth/logout"),
  listarUsuarios: () => api<ApiResponse & { usuarios: Usuario[] }>("GET", "/api/admin/usuarios"),
  suspender: (id: number) => api(`POST`, `/api/admin/usuarios/${id}/suspender`),
  reativar: (id: number) => api(`POST`, `/api/admin/usuarios/${id}/reativar`),
  redefinirSenhaAdmin: (id: number) =>
    api<ApiResponse & { novaSenhaTemporaria?: string }>("POST", `/api/admin/usuarios/${id}/redefinir-senha`),
};

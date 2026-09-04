import { useCallback, useEffect, useMemo, useState } from "react";
import {
  App as AntdApp,
  Button,
  Layout,
  Modal,
  Popconfirm,
  Result,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { LogoutOutlined } from "@ant-design/icons";
import { AUTH, type Usuario } from "./api";

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

type Estado = "carregando" | "negado" | "ok";

export default function App() {
  const { message } = AntdApp.useApp();
  const [estado, setEstado] = useState<Estado>("carregando");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregandoTabela, setCarregandoTabela] = useState(false);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);

  const carregarUsuarios = useCallback(async () => {
    setCarregandoTabela(true);
    const resposta = await AUTH.listarUsuarios();
    setCarregandoTabela(false);
    if (!resposta.ok) {
      setEstado("negado");
      return;
    }
    setUsuarios(resposta.usuarios);
    setEstado("ok");
  }, []);

  useEffect(() => {
    (async () => {
      const me = await AUTH.me();
      if (!me.ok || !me.usuario?.isAdmin) {
        setEstado("negado");
        return;
      }
      carregarUsuarios();
    })();
  }, [carregarUsuarios]);

  async function sair() {
    await AUTH.logout();
    window.location.href = "/login.html";
  }

  async function suspender(id: number) {
    await AUTH.suspender(id);
    message.success("Conta suspensa.");
    carregarUsuarios();
  }

  async function reativar(id: number) {
    await AUTH.reativar(id);
    message.success("Conta reativada.");
    carregarUsuarios();
  }

  async function redefinirSenha(id: number) {
    const resp = await AUTH.redefinirSenhaAdmin(id);
    if (resp.ok && resp.novaSenhaTemporaria) {
      setSenhaGerada(resp.novaSenhaTemporaria);
    } else {
      message.error(resp.erro ?? "Não foi possível redefinir a senha.");
    }
    carregarUsuarios();
  }

  const colunas: ColumnsType<Usuario> = useMemo(
    () => [
      {
        title: "Nome completo",
        dataIndex: "nomeCompleto",
        key: "nomeCompleto",
        render: (nome: string, u) => (
          <>
            {nome}
            {u.isAdmin && (
              <Tag color="gold" style={{ marginLeft: 8 }}>
                Admin
              </Tag>
            )}
          </>
        ),
      },
      { title: "E-mail", dataIndex: "email", key: "email" },
      { title: "Celular", dataIndex: "celular", key: "celular" },
      { title: "Endereço", dataIndex: "endereco", key: "endereco" },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: Usuario["status"]) =>
          status === "suspenso" ? <Tag color="error">Suspenso</Tag> : <Tag color="success">Ativo</Tag>,
      },
      { title: "Cadastro", dataIndex: "criadoEm", key: "criadoEm", render: formatarData },
      { title: "Último login", dataIndex: "ultimoLoginEm", key: "ultimoLoginEm", render: formatarData },
      {
        title: "Ações",
        key: "acoes",
        render: (_, u) =>
          u.isAdmin ? (
            "—"
          ) : (
            <Space>
              {u.status === "suspenso" ? (
                <Popconfirm title="Reativar esta conta?" onConfirm={() => reativar(u.id)}>
                  <Button size="small">Reativar</Button>
                </Popconfirm>
              ) : (
                <Popconfirm title="Suspender esta conta?" onConfirm={() => suspender(u.id)}>
                  <Button size="small" danger>
                    Suspender
                  </Button>
                </Popconfirm>
              )}
              <Popconfirm title="Gerar uma nova senha temporária?" onConfirm={() => redefinirSenha(u.id)}>
                <Button size="small" type="text">
                  Redefinir senha
                </Button>
              </Popconfirm>
            </Space>
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (estado === "negado") {
    return (
      <Result
        status="403"
        title="Acesso negado"
        subTitle="Você não tem permissão para ver esta página."
        extra={
          <Button type="primary" href="/login.html">
            Entrar com outra conta
          </Button>
        }
      />
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Space align="center">
          <img src="/assets/img/logo-oficial.png" alt="" width={32} height={32} />
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            Rota dos Celulares 66 — Admin
          </Title>
        </Space>
        <Button icon={<LogoutOutlined />} onClick={sair}>
          Sair
        </Button>
      </Header>
      <Content style={{ padding: 24 }}>
        <Title level={3}>Usuários cadastrados</Title>
        <Paragraph type="secondary">
          Aqui você vê os dados de cadastro de cada cliente, o status da conta e pode suspender, reativar ou gerar
          uma nova senha temporária. Por segurança, a senha original nunca é exibida.
        </Paragraph>

        {estado === "carregando" ? (
          <Skeleton active />
        ) : (
          <Table
            rowKey="id"
            columns={colunas}
            dataSource={usuarios}
            loading={carregandoTabela}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Content>

      <Modal
        title="Nova senha temporária"
        open={senhaGerada !== null}
        onOk={() => setSenhaGerada(null)}
        onCancel={() => setSenhaGerada(null)}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <Paragraph>Repasse esta senha ao cliente com segurança. Ela não será mostrada novamente.</Paragraph>
        <Text code copyable style={{ fontSize: 16 }}>
          {senhaGerada}
        </Text>
      </Modal>
    </Layout>
  );
}

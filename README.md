[README.md](https://github.com/user-attachments/files/35434621/README.md)
# Atlas ENEM 2027 — Planejador de Estudos

Aplicação web estática para organizar a preparação para o ENEM 2027. Não exige servidor, banco de dados, Node.js ou etapa de build.

## Arquivos

- `index.html` — estrutura e componentes da interface.
- `style.css` — identidade visual, responsividade e tema claro/escuro.
- `script.js` — cronograma, cálculos, formulários, gráficos e persistência local.
- `README.md` — este guia.

## Executar localmente

1. Baixe ou clone este repositório.
2. Mantenha os três arquivos principais na mesma pasta.
3. Abra `index.html` no navegador.

Chart.js, Lucide e fontes são carregados por CDN. Para carregar essas dependências, é necessária conexão com a internet. A aplicação e os dados funcionam no próprio navegador.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `atlas-enem-2027`.
2. Envie `index.html`, `style.css`, `script.js` e `README.md` para a raiz do repositório.
3. Abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/ (root)`; clique em **Save**.
6. Aguarde a publicação e abra o endereço informado pelo GitHub Pages.

Não é necessário configurar Actions, instalar pacotes ou criar backend.

## Dados e backup

- Os dados são salvos automaticamente em `localStorage` no navegador e dispositivo em que a aplicação foi usada.
- Use **Exportar backup** para baixar um arquivo JSON.
- Use **Importar backup** para restaurar um JSON exportado anteriormente. A importação substitui os dados atuais.
- **Resetar dados** zera tudo e começa vazio. **Carregar exemplo** carrega dados fictícios de demonstração (substitui os dados atuais).

> Importante: limpar os dados do site/navegador, usar outro navegador, outro dispositivo ou uma janela privada pode apagar ou não disponibilizar os dados locais. Exporte backups regularmente. O `localStorage` não sincroniza dados entre dispositivos.

## Estrutura do cronograma

O planejador contém 11 meses × 4 semanas = 44 semanas. Cada semana possui seis dias (segunda a sábado) e três blocos editáveis por dia, totalizando 18 blocos por semana. Os assuntos iniciais são sugestões e podem ser alterados.

A meta semanal de 315 questões é acompanhada pelo total digitado nos blocos. O volume de questões e acertos é agregado para os indicadores. O percentual do edital considera os 792 blocos marcados como concluídos (não representa uma contagem oficial de todos os tópicos do edital do ENEM).

A redação semanal permite marcar entrega e registrar nota. Simulados ficam programados nas semanas pares.

## Personalização

- Edite a distribuição inicial de matérias em `DISTRIBUTION` e os assuntos em `TOPICS`, no início de `script.js`.
- Metas e tamanho do plano ficam nas constantes `WEEKS`, `WEEKLY_GOAL` e `BLOCKS_PER_WEEK` no início de `script.js` (a meta anual é `WEEKS × WEEKLY_GOAL` = 13.860).
- A chave de armazenamento é `atlas-enem-2027-v1`. Evite alterá-la depois de começar a usar, para não deixar de encontrar os dados existentes.

## Observações técnicas

- HTML5, CSS3 e JavaScript puro.
- Chart.js para o gráfico de evolução.
- Lucide para ícones.
- Sem backend: os dados permanecem no navegador do usuário.
- Para uso real, mantenha cópias de backup fora do dispositivo principal.


## Atualização v2.0

### XP e níveis
- +1 XP por questão nova registrada, +2 XP por acerto, +30 XP por bloco de conteúdo concluído.
- +25 XP por hora de cronômetro (proporcional por minuto), +100 XP por redação semanal, +150 XP por simulado cadastrado e +50 XP por simulado realizado no cronograma.
- O sistema registra um ledger por bloco para não conceder XP repetido ao salvar sem alteração. O histórico antigo vira linha de base na migração e não recebe XP retroativo.
- Níveis usam faixas cumulativas crescentes: `XP necessário para entrar no nível L = 150 × (L−1) + 35 × (L−1) × (L−2)`.

### Ranking F–SSS
Pontuação composta (0–100): precisão 35%, semanas que atingiram 315 questões 25%, média bruta dos simulados em relação a 180 (15%), evolução entre o primeiro e o último simulado (10%), conclusão dos blocos do cronograma (10%) e redações entregues (5%). Faixas: F 0–19,9; D 20–31,9; C 32–43,9; B 44–55,9; A 56–67,9; S 68–79,9; SS 80–89,9; SSS 90–100. Rankings por área usam a precisão registrada daquela área/matéria. Não é uma classificação oficial.

### Revisão espaçada
Cada erro novo recebe vencimentos de 1, 7, 15 e 30 dias. Ao concluir uma etapa, a próxima é agendada a partir da data da conclusão. "Errei novamente" reinicia a sequência para o dia seguinte. Ao concluir a quarta etapa, o registro é marcado como dominado.

### TRI estimada
A aplicação converte acertos brutos em uma faixa ilustrativa de 300 a 800 pontos e aplica uma penalização de coerência quando acertos informados em itens difíceis superam acertos em itens fáceis. É uma heurística comparativa, não TRI oficial: sem parâmetros calibrados dos itens e respostas individuais, não é possível reproduzir o cálculo TRI do Inep. Registros antigos sem padrão de dificuldade recebem estimativa neutra baseada somente nos acertos.

### Metas adaptativas
A meta 315 é redistribuída entre nove matérias com base na precisão registrada, no número de erros não dominados e no desempenho mais recente por área nos simulados. A sugestão é apenas aplicada após clicar em **Aceitar redistribuição** e pode ser restaurada. As metas por bloco são separadas das questões efetivamente realizadas.

### Calendário 2027
As 44 semanas iniciam na segunda-feira, 4 de janeiro de 2027, e exibem intervalos de segunda a sábado. Os quatro blocos de cada mês são agrupamentos sequenciais de quatro semanas para manter o modelo solicitado (11 × 4); como meses reais não têm exatamente quatro semanas, alguns intervalos de datas atravessam o limite entre meses. A semana atual só é destacada durante o período coberto em 2027.

### Migração e backup
A primeira abertura da v2 preserva semanas, simulados, erros e tema salvos pela v1. Os dados existentes são usados como linha de base do XP, evitando recompensa retroativa. Exportações v2 incluem `v2.xp`, ledger, minutos de estudo, metas adaptativas, histórico de revisão e dados de coerência TRI. Backups v1 continuam importáveis.

## Atualização v2.1 — correções

- XP de redação semanal e simulado agora é concedido uma única vez por semana/simulado (ledger); excluir e recriar simulado não gera XP repetido.
- Datas passam a usar o fuso local (antes, após 21h no Brasil, gravava o dia seguinte).
- `adaptivePlan` não altera mais a ordem global das matérias.
- Erro marcado como dominado no formulário sai da fila de revisões.
- A data do painel é calculada; a meta anual é única (13.860 = 44 × 315) e centralizada em constantes.
- Consistência do ranking usa as semanas decorridas como denominador.
- Gravação em `localStorage` com tratamento de falha (o selo "Salvo" reflete o resultado real).
- Dados salvos e backups importados são validados e normalizados antes do uso; dados inválidos no armazenamento local são preservados em `atlas-enem-2027-v1-invalido`.
- O app agora começa vazio; os dados de exemplo são opcionais.

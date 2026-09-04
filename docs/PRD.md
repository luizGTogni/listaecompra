# Lista & Compra

## Requisitos Funcionais (RF)

[x] RF01 - O sistema deve permitir que o usuário crie uma conta para acessar a plataforma.
[X] RF02 - O sistema deve enviar um código de verificação por e-mail após o cadastro do usuário.
[x] RF03 - O sistema deve pedir para o usuário inserir o código de verificação recebido por e-mail.
[x] RF04 - O sistema deve permitir o reenvio do código de verificação, caso o usuário não o receba.
[x] RF05 - O sistema deve permitir que o usuário confirme sua conta ao inserir o código correto.
[x] RF06 - O sistema deve permitir que o usuário faça login na plataforma.
[ ] RF07 - O sistema deve permitir que o usuário adicione produtos e sua quantidade na lista de compras.
[ ] RF08 - O sistema deve permitir que o usuário remova produtos e quantidades na lista de compras.
[ ] RF09 - O sistema deve permitir que o usuário visualize a lista de compras.
[ ] RF10 - O sistema deve permitir que o usuário finalize a compra dos produtos na lista.
[ ] RF11 - O sistema deve permitir que o usuário crie uma lista de compras.
[ ] RF12 - O sistema deve permitir que o usuário compartilhe a lista de compras com outros usuários.
[ ] RF13 - O sistema deve permitir que o usuário recupere a senha via e-mail (esqueci minha senha).
[ ] RF14 - O sistema deve permitir que o usuário altere sua senha.
[ ] RF16 - O sistema deve permitir que o usuário edite a quantidade de um produto na lista.
[ ] RF18 - O sistema deve permitir que o usuário marque um produto como "já comprado" sem removê-lo da lista.
[ ] RF19 - O sistema deve permitir que o usuário desmaque um produto como "já comprado".
[ ] RF20 - O sistema deve permitir que o usuário remova o compartilhamento de uma lista com outro usuário.
[ ] RF21 - O sistema deve permitir que o usuário exclua uma lista de compras.
[ ] RF21 - O sistema deve permitir que o usuário faça logout da plataforma.

## Regras de Negócio (RN)

[x] RN01 - O código de verificação deve expirar após um determinado período (ex: 15 minutos).
[x] RN02 - O usuário não pode acessar funcionalidades da conta antes de verificar o e-mail.
[x] RN03 - Um novo código gerado invalida automaticamente o código anterior.
[ ] RN04 - O sistema deve validar se o usuário está logado antes de permitir a criação de uma lista de compras.
[ ] RN05 - O sistema deve validar se o usuário está logado antes de permitir a adição ou remoção de produtos da lista de compras.
[ ] RN06 - O sistema deve validar se o usuário está logado antes de permitir a finalização da compra dos produtos na lista.
[ ] RN07 - O sistema deve validar se o usuário está logado antes de permitir o compartilhamento da lista de compras com outros usuários.
[ ] RN08 - O sistema deve permitir que o usuário visualize apenas suas próprias listas de compras, a menos que tenha sido compartilhada com ele por outro usuário.
[ ] RN09 - O sistema deve permitir que o usuário visualize apenas os produtos que ele adicionou à lista de compras, a menos que tenha sido compartilhada com ele por outro usuário.
[ ] RN10 - O nome de uma lista não pode ser duplicado para o mesmo usuário.
[ ] RN11 - Um produto não pode ser adicionado com quantidade menor ou igual a zero.
[ ] RN12 - Apenas o dono da lista pode compartilhar, editar o nome ou excluir a lista.
[ ] RN13 - Um usuário convidado (lista compartilhada) pode adicionar/remover produtos, mas não excluir a lista.
[ ] RN14 - Um produto marcado como "comprado" não pode ter a quantidade editada, apenas removido.
[x] RN15 - O sistema não deve permitir login antes da verificação de e-mail (reforça o RN02).
[ ] RN16 - O token de recuperação de senha deve expirar após um período determinado (ex: 30 minutos).

## Requisitos Não Funcionais (RNF)

[x] RNF01 - O código de verificação deve ser gerado de forma aleatória e não sequencial, para evitar previsibilidade.
[ ] RNF02 - O e-mail de verificação deve ser enviado em até 30 segundos após o cadastro.
[x] RNF03 - As senhas dos usuários devem ser armazenadas com hash (bcrypt/argon2), nunca em texto plano.
[ ] RNF04 - A API deve responder em até 300ms para 95% das requisições.
[x] RNF05 - O sistema deve suportar autenticação via JWT com expiração de token.
[x] RNF06 - A API deve possuir documentação OpenAPI/Swagger disponível.
[x] RNF07 - O sistema deve registrar logs estruturados de erros em produção.
[ ] RNF08 - O sistema deve aplicar rate limiting para evitar abuso em rotas sensíveis (login, criação de conta).
[ ] RNF09 - A aplicação deve ser compatível com execução em containers Docker.

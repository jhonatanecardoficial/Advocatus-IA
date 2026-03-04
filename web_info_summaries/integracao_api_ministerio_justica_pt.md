## Relatório sobre a Disponibilidade e Documentação de APIs para Integração com Sistemas do Ministério da Justiça em Portugal

Este relatório visa verificar a disponibilidade e a documentação pública de APIs para integração com os sistemas CITIUS e outros portais do Ministério da Justiça (MJ) em Portugal, focando na viabilidade de conexão para terceiros.

### 1. Disponibilidade de APIs para o Sistema CITIUS

Não foi identificada documentação oficial que suporte a integração de APIs públicas para terceiros com o sistema CITIUS com o propósito de acesso programático a processos judiciais ou funcionalidades equivalentes. A informação disponível sobre o CITIUS destina-se primariamente aos utilizadores diretos do sistema, como advogados e advogados estagiários, para a prática processual eletrónica [ref: 1-0].

*   **Acesso para Advogados e Estagiários no CITIUS:** O processo de registo envolve o envio de um pedido assinado digitalmente, a utilização do Certificado Digital da Ordem dos Advogados e a receção de credenciais (nome de utilizador e palavra-passe temporária) [ref: 1-0]. As peças processuais são assinadas digitalmente através da aplicação SIGNIUS – Assinatura Digital, gerida pelo IGFEJ [ref: 1-0], [ref: 1-5].
*   **Funcionalidades Existentes no Portal CITIUS:** O portal oferece serviços como a consulta da autenticidade da comunicação e a consulta de documentos relativos ao procedimento de injunção [ref: 1-2], [ref: 1-4]. Estas são interfaces de utilizador e não APIs para integração.

### 2. APIs para Outros Portais e Dados Abertos do Ministério da Justiça

O Ministério da Justiça, através de portais como `dados.gov.pt` e `dados.justica.gov.pt`, disponibiliza dados abertos que podem ser acedidos via API.

*   **Portal de Dados Abertos (`dados.gov.pt` e `dados.justica.gov.pt`):**
    *   **Disponibilidade:** O `dados.gov.pt` é o portal nacional de dados abertos da Administração Pública Portuguesa e permite a publicação e consulta de dados de interesse público por organismos públicos, incluindo os do MJ [ref: 2-5]. O `dados.justica.gov.pt` é um subdomínio para dados da Justiça [ref: 0-9].
    *   **Escopo da API:** Permite o acesso a conjuntos de dados governamentais em formatos estruturados como JSON e CSV [ref: 0-4], [ref: 2-5]. Exemplos de conjuntos de dados da Direção-Geral da Política de Justiça incluem insolvências, processos laborais, cíveis, tutelares e de promoção e proteção em tribunais judiciais de 1.ª instância [ref: 0-4].
    *   **Documentação e Exemplos de Uso:** O tutorial "Criar visualizações a partir dos dados abertos da Justiça" demonstra o uso da API CKAN (`/api/action/datastore_search`) para aceder a estes dados e criar gráficos ou mapas com tecnologias open-source [ref: 2-8].

#### 2.1. Requisitos de Autenticação e Acesso

*   **Acesso a Dados Abertos:** Para a consulta e descarregamento de dados disponibilizados em `dados.gov.pt`, não é necessária qualquer inscrição ou registo prévio. O acesso aos dados via API (CKAN API) para consumo é público [ref: 2-5], [ref: 2-8].
*   **Publicação de Dados:** Para publicar conjuntos de dados no portal, o utilizador deve registar-se e autenticar-se, criando um perfil individual [ref: 2-5].
*   **Autenticação Geral (não específica do MJ):** A autenticação em APIs genéricas geralmente é feita através de um token de acesso (Bearer Token/JWT), obtido após login com um utilizador administrador ou uma Service Account, e tem duração limitada (e.g., 24 horas) [ref: 1-1], [ref: 1-3]. Requisições com credenciais inválidas ou expiradas resultam em estados HTTP 403 ou 302 [ref: 1-1].

#### 2.2. Restrições e Termos de Uso

*   **Licenciamento dos Dados:** Muitos conjuntos de dados da Justiça (e.g., os da Direção-Geral da Política de Justiça) estão sob a licença Creative Commons Attribution 4.0 (CC BY 4.0) [ref: 0-4]. A reutilização de conteúdos para fins não comerciais é permitida, desde que o IRN, I.P. seja explicitamente mencionado como fonte. Qualquer utilização para fins comerciais ou modificação do conteúdo requer autorização prévia por escrito [ref: 2-0].
*   **Uso Aceitável e Web Scraping:**
    *   O `dados.gov.pt` permite o "scraping" de informações públicas e não pessoais para fins de pesquisa (desde que as publicações resultantes sejam de acesso aberto) e para arquivamento. Contudo, o "scraping" para spam ou venda de informações pessoais é proibido. Qualquer utilização de dados recolhidos por "scraping" deve estar em conformidade com a Política de Privacidade [ref: 2-3].
    *   Em contraste, os portais do Instituto dos Registos e do Notariado (IRN, I.P.), sob a alçada do MJ, proíbem expressamente o uso de técnicas de "web scraping" ou qualquer outro método automatizado para extração de dados sem autorização. Esta prática pode violar a legislação sobre direitos de autor, proteção de dados pessoais e acesso não autorizado a sistemas informáticos [ref: 2-0].
*   **Restrições de Conteúdo:** O `dados.gov.pt` não se destina à difusão de dados publicitários, promoção de interesses privados ou atividades ilícitas. Em caso de anomalia, a AMA (entidade gestora) pode suspender ou remover o acesso a conjuntos de dados [ref: 2-5].
*   **Proteção de Dados Pessoais:** As entidades do Ministério da Justiça (e.g., DGAJ, PGR, IRN) aderem ao Regulamento Geral sobre a Proteção de Dados (RGPD - Regulamento UE 2016/679) e à Lei n.º 58/2019 [ref: 2-0], [ref: 2-1], [ref: 2-9]. Os dados pessoais são tratados de forma segura e confidencial, limitados às finalidades para as quais foram recolhidos, e são salvaguardados os direitos dos titulares dos dados (acesso, retificação, eliminação, oposição) [ref: 2-0], [ref: 2-1], [ref: 2-9].
*   **Transferência de Dados:** A partilha de dados entre entidades públicas (e.g., tribunais, Ministério Público) ocorre quando imposto por deveres legais [ref: 2-9]. Transferências internacionais de dados pessoais seguem as disposições legais aplicáveis [ref: 2-9].

### 3. Outras Iniciativas de Transformação Digital

A "Transformação Digital da Justiça 2015-2022" e a "Estratégia Digital Nacional" indicam um forte investimento na digitalização dos serviços de justiça, com medidas para tornar o sistema mais transparente, acessível e eficaz, incluindo a utilização de tecnologias digitais e soluções de inteligência artificial [ref: 0-0], [ref: 1-9], [ref: 0-8]. Estas estratégias incluem "Dados e Interoperabilidade" e a criação de um "Novo Regime de Interoperabilidade" e "Política Nacional de Dados", sinalizando um caminho para maior integração e partilha de dados no futuro [ref: 0-8].

### Conclusão

Embora não exista uma API pública para integração direta com o sistema CITIUS para terceiros, o Ministério da Justiça em Portugal disponibiliza uma vasta quantidade de dados abertos através do portal `dados.gov.pt` (e `dados.justica.gov.pt`), acessíveis via API CKAN. Esta é a principal via para terceiros obterem dados do MJ de forma programática. É crucial que os integradores externos observem rigorosamente os termos de uso e as políticas de privacidade e proteção de dados associadas a cada conjunto de dados e portal.
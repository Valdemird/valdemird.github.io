// Curated reference videos for the agentic-systems course, one or two per
// module. Each was fact-checked for provenance (official primary source, not a
// re-upload), authority, 2026 currency, and topical fit by an adversarial review
// pass; the `why`/`reasons` power the in-page "why is this relevant?" panel.
// Generated from that curation — edit here to adjust copy.

export type Lang = 'en' | 'es';
export type VideoTier = 'essential' | 'recommended' | 'optional';

export interface LearnVideo {
	/** Module slug this video accompanies. */
	slug: string;
	/** Canonical watch URL (YouTube or, for non-YouTube talks, the host page). */
	url: string;
	/** YouTube id for the click-to-load facade, or null for non-YouTube sources. */
	youtubeId: string | null;
	title: string;
	author: string;
	tier: VideoTier;
	/** One-line, reader-facing reason to watch (bilingual). */
	why: { en: string; es: string };
	/** Vetted bullet reasons for the expandable relevance panel (bilingual). */
	reasons: { en: string[]; es: string[] };
}

export const LEARN_VIDEOS: LearnVideo[] = [
	{
		slug: "llm-substrate",
		url: "https://www.youtube.com/watch?v=wjZofJX0v4M",
		youtubeId: "wjZofJX0v4M",
		title: "Transformers, the tech behind LLMs | Deep Learning Chapter 5",
		author: "Grant Sanderson (3Blue1Brown)",
		tier: "essential",
		why: { en: "It builds the mental model this module needs — what a transformer actually is — walking through tokenization, embeddings, dot-product similarity, softmax, and the matrix math that turns text into next-token predictions.", es: "Construye el modelo mental que necesita este módulo — qué es realmente un transformer — recorriendo tokenización, embeddings, similitud por producto punto, softmax y el álgebra de matrices que convierte texto en predicciones del siguiente token." },
		reasons: {
			en: ["Grant Sanderson (3Blue1Brown) is a widely recognized standard for rigorous, visual explanation of deep-learning internals.", "Explains the LLM substrate itself — the mechanism beneath every agent — rather than a topic adjacent to it.", "Teaches transformer fundamentals (embeddings, attention, softmax, the matmul core) that remain accurate for frontier models in 2026."],
			es: ["Grant Sanderson (3Blue1Brown) es un referente reconocido por sus explicaciones rigurosas y visuales del funcionamiento interno del deep learning.", "Explica el sustrato del propio LLM — el mecanismo que hay debajo de cualquier agente — en lugar de un tema cercano.", "Enseña los fundamentos del transformer (embeddings, attention, softmax, el núcleo de multiplicación de matrices) que siguen siendo válidos para los modelos de frontera en 2026."],
		},
	},
	{
		slug: "llm-substrate",
		url: "https://www.youtube.com/watch?v=7xTGNNLPyMI",
		youtubeId: "7xTGNNLPyMI",
		title: "Deep Dive into LLMs like ChatGPT",
		author: "Andrej Karpathy",
		tier: "essential",
		why: { en: "A 3.5-hour end-to-end walkthrough of how an LLM is built — pretraining, tokenization, supervised fine-tuning, and RLHF — the exact substrate you need to understand before building agents on top of one.", es: "Un recorrido de 3,5 horas de principio a fin sobre cómo se construye un LLM — pretraining, tokenización, supervised fine-tuning y RLHF — justo el sustrato que necesitas entender antes de construir agentes sobre él." },
		reasons: {
			en: ["Taught by Andrej Karpathy, an OpenAI founding member and former Sr. Director of AI at Tesla, known for the Neural Networks: Zero to Hero series.", "Covers what an LLM actually is and how it is trained and behaves — from pretraining through RLHF, plus mental models for hallucination and tool use.", "The training-stack fundamentals it teaches remain accurate and load-bearing in 2026, not tied to any single model release."],
			es: ["Impartido por Andrej Karpathy, miembro fundador de OpenAI y ex Sr. Director de AI en Tesla, conocido por la serie Neural Networks: Zero to Hero.", "Explica qué es realmente un LLM y cómo se entrena y se comporta — desde el pretraining hasta el RLHF, con modelos mentales para la alucinación y el uso de herramientas.", "Los fundamentos del stack de entrenamiento que enseña siguen siendo precisos y relevantes en 2026, sin atarse a ningún lanzamiento de modelo concreto."],
		},
	},
	{
		slug: "agent-as-policy",
		url: "https://www.youtube.com/watch?v=egJgDbe5oaM",
		youtubeId: "egJgDbe5oaM",
		title: "CS 285: Lecture 21, RL with Sequence Models & Language Models, Part 1",
		author: "Sergey Levine (UC Berkeley CS285 / RAIL Lab)",
		tier: "recommended",
		why: { en: "A UC Berkeley lecture that frames language and sequence models as RL policies, connecting MDP and policy-optimization machinery to the token-generating agents behind the \"agent as a policy\" idea.", es: "Una clase de UC Berkeley que plantea los modelos de lenguaje y de secuencias como políticas de RL, conectando el aparato de MDP y optimización de políticas con los agentes generadores de tokens detrás de la idea de \"agente como política\"." },
		reasons: {
			en: ["Taught by Sergey Levine, the CS285 instructor and a leading reinforcement-learning and robot-learning researcher, speaking on his own core subject.", "Develops the agent-as-policy framing directly: treating sequence and language models as policies optimized with RL rather than mere next-token predictors.", "From late 2023, but the policy-over-sequences view it teaches remains the standard framing for trained agents in 2026."],
			es: ["Impartida por Sergey Levine, profesor de CS285 e investigador destacado en aprendizaje por refuerzo y aprendizaje robótico, hablando sobre su tema central.", "Desarrolla directamente la idea de agente como política: tratar los modelos de lenguaje y de secuencias como políticas optimizadas con RL, no solo como predictores del siguiente token.", "Es de finales de 2023, pero la visión de política sobre secuencias que enseña sigue siendo el marco estándar para agentes entrenados en 2026."],
		},
	},
	{
		slug: "agent-as-policy",
		url: "https://www.youtube.com/watch?v=zwfE6J2BIR4",
		youtubeId: "zwfE6J2BIR4",
		title: "Language Agents (Shunyu Yao PhD Defense)",
		author: "Shunyu Yao (Princeton)",
		tier: "essential",
		why: { en: "In his own thesis defense, Shunyu Yao frames the LLM as the agent's decision-making policy, formalized through ReAct and the CoALA architecture's action-selection loop — the exact idea this module teaches.", es: "En la defensa de su propia tesis, Shunyu Yao plantea el LLM como la política de decisión del agente, formalizada con ReAct y el bucle de selección de acciones de la arquitectura CoALA — justo la idea que enseña este módulo." },
		reasons: {
			en: ["Shunyu Yao authored ReAct, Tree of Thoughts, and CoALA — foundational work on LLMs that reason and act as policies — and later built Operator and Deep Research at OpenAI.", "Goes straight to the agent-as-policy idea: CoALA defines a language agent's generalized decision process for choosing actions, exactly what this module covers.", "It teaches a conceptual framing — reasoning plus acting as the policy — that remains the standard mental model for agentic systems in 2026."],
			es: ["Shunyu Yao es autor de ReAct, Tree of Thoughts y CoALA — trabajos fundacionales sobre LLMs que razonan y actúan como políticas — y luego creó Operator y Deep Research en OpenAI.", "Va directo a la idea del agente como política: CoALA define el proceso de decisión generalizado de un agente de lenguaje para elegir acciones, justo lo que cubre este módulo.", "Enseña un marco conceptual — razonar y actuar como la política — que sigue siendo el modelo mental estándar para los sistemas agénticos en 2026."],
		},
	},
	{
		slug: "context-engineering",
		url: "https://www.youtube.com/watch?v=_IlTcWciEC4",
		youtubeId: "_IlTcWciEC4",
		title: "Context Engineering for Agents - Lance Martin, LangChain",
		author: "Lance Martin (LangChain), on the Latent Space podcast (Alessio Fanelli & swyx)",
		tier: "essential",
		why: { en: "Lance Martin, who authored LangChain's \"Context Engineering for Agents\" framework, walks through its core categories — write, select, compress, isolate, and offload context — straight from the source.", es: "Lance Martin, autor del marco \"Context Engineering for Agents\" de LangChain, recorre sus categorías centrales — write, select, compress, isolate y offload del contexto — directamente desde la fuente." },
		reasons: {
			en: ["Lance Martin is an early LangChain engineer and Stanford ML PhD who coined the context-engineering-for-agents taxonomy and built Open Deep Research.", "Covers the module's exact subject: how context engineering differs from prompt engineering, and how to offload, retrieve, compress, and isolate context across tool calls.", "Published September 2025; the framework and strategies remain standard practice for agent builders in 2026."],
			es: ["Lance Martin es uno de los primeros ingenieros de LangChain y doctor en ML por Stanford; acuñó la taxonomía de context engineering para agentes y construyó Open Deep Research.", "Aborda el tema exacto del módulo: cómo se diferencia el context engineering del prompt engineering, y cómo offload, recuperar, comprimir y aislar contexto entre llamadas a herramientas.", "Publicado en septiembre de 2025; el marco y las estrategias siguen siendo práctica estándar para quienes construyen agentes en 2026."],
		},
	},
	{
		slug: "context-engineering",
		url: "https://www.youtube.com/watch?v=mR-WAvEPRwE",
		youtubeId: "mR-WAvEPRwE",
		title: "Anthropic Workshop: Build Agents That Run for Hours — Ash Prabaker & Andrew Wilson",
		author: "Ash Prabaker & Andrew Wilson (Anthropic), at AI Engineer",
		tier: "essential",
		why: { en: "Two Anthropic engineers break down what makes a long-running agent stay coherent over hours: context rot, compaction, and keeping state on the filesystem instead of in the window.", es: "Dos ingenieros de Anthropic explican qué mantiene coherente a un agente de larga duración durante horas: context rot, compaction y guardar el estado en el sistema de archivos en vez de en la ventana." },
		reasons: {
			en: ["Led by Ash Prabaker and Andrew Wilson, Anthropic applied engineers who build long-running agent harnesses and work directly on Claude model/harness co-evolution.", "Goes straight at the core mechanics of context engineering: context rot, context-window degradation, server-side compaction, and filesystem-backed state for long-horizon agents.", "Current as of June 2026 — references model progress through Opus 4.6 and present-day harness techniques, so the guidance is up to date."],
			es: ["Presentado por Ash Prabaker y Andrew Wilson, ingenieros de Anthropic que construyen harnesses para agentes de larga duración y trabajan en la co-evolución de modelo y harness de Claude.", "Aborda de lleno los mecanismos centrales del context engineering: context rot, degradación de la ventana de contexto, compaction del lado del servidor y estado respaldado en el filesystem para agentes de horizonte largo.", "Actualizado a junio de 2026: menciona el avance de los modelos hasta Opus 4.6 y técnicas de harness actuales, así que la guía está vigente."],
		},
	},
	{
		slug: "tools-and-mcp",
		url: "https://www.youtube.com/watch?v=kQmXtrmQ5Zg",
		youtubeId: "kQmXtrmQ5Zg",
		title: "Building Agents with Model Context Protocol — Full Workshop with Mahesh Murag of Anthropic",
		author: "Mahesh Murag (Anthropic, Applied AI) — at the AI Engineer Summit",
		tier: "essential",
		why: { en: "A two-hour workshop from an Anthropic engineer who helped build the Model Context Protocol, taking you from what MCP is through servers, clients, tools, resources, and using MCP with agents.", es: "Un taller de dos horas de un ingeniero de Anthropic que ayudó a construir el Model Context Protocol, desde qué es MCP hasta servidores, clientes, herramientas, recursos y el uso de MCP con agentes." },
		reasons: {
			en: ["Mahesh Murag is an Anthropic Applied AI engineer and core builder of MCP, the open standard this module teaches — he explains it from the source.", "Structured end-to-end coverage: what MCP is, building servers and clients, tools/resources/prompts, MCP with agents, and where the protocol is headed.", "Recorded March 2025: the core concepts hold, but pair it with the current MCP spec, since transport details and governance (now under the Linux Foundation) have since evolved."],
			es: ["Mahesh Murag es ingeniero de Applied AI en Anthropic y uno de los creadores de MCP, el estándar abierto que enseña este módulo: lo explica desde la fuente.", "Cobertura estructurada de principio a fin: qué es MCP, cómo construir servidores y clientes, tools/resources/prompts, MCP con agentes y hacia dónde va el protocolo.", "Grabado en marzo de 2025: los conceptos centrales siguen vigentes, pero acompáñalo con la especificación actual de MCP, ya que los detalles de transporte y la gobernanza (ahora bajo la Linux Foundation) han evolucionado."],
		},
	},
	{
		slug: "agent-loop",
		url: "https://www.youtube.com/watch?v=D7_ipDqhtwk",
		youtubeId: "D7_ipDqhtwk",
		title: "How We Build Effective Agents: Barry Zhang, Anthropic",
		author: "Barry Zhang (Anthropic, Applied AI) — AI Engineer Summit 2025",
		tier: "essential",
		why: { en: "Barry Zhang defines an agent as \"models using tools in a loop\" and walks through the Thought–Action–Observation cycle and its three parts — environment, tools, system prompt — the exact idea this module teaches.", es: "Barry Zhang define un agente como \"modelos usando herramientas en un bucle\" y recorre el ciclo Pensamiento–Acción–Observación y sus tres partes — entorno, herramientas, system prompt — la idea exacta que enseña este módulo." },
		reasons: {
			en: ["Barry Zhang is on Anthropic's Applied AI staff, speaking from the team behind Anthropic's canonical 'Building Effective Agents' guidance.", "Teaches the core pattern head-on: models using tools in a loop, plus the Thought–Action–Observation cycle and the role of environment, tools, and system prompt.", "Recorded at AI Engineer Summit 2025; the loop framing and 'keep it simple, think like the agent' principles still hold in 2026."],
			es: ["Barry Zhang forma parte del equipo de Applied AI de Anthropic y habla desde el grupo detrás de la guía canónica 'Building Effective Agents' de Anthropic.", "Enseña el patrón central de forma directa: modelos usando herramientas en un bucle, junto con el ciclo Pensamiento–Acción–Observación y el papel del entorno, las herramientas y el system prompt.", "Grabado en el AI Engineer Summit 2025; el enfoque del bucle y los principios de 'mantenlo simple, piensa como el agente' siguen vigentes en 2026."],
		},
	},
	{
		slug: "agent-loop",
		url: "https://www.youtube.com/watch?v=LCEmiRjPEtQ",
		youtubeId: "LCEmiRjPEtQ",
		title: "Andrej Karpathy: Software Is Changing (Again)",
		author: "Andrej Karpathy (Y Combinator — AI Startup School)",
		tier: "recommended",
		why: { en: "Karpathy's keynote frames the human-in-the-loop, partial-autonomy operating model an agent loop must implement, and argues software should expose agent-readable interfaces.", es: "La charla de Karpathy plantea el modelo de operación de autonomía parcial con humano en el bucle que un agent loop debe implementar, y defiende que el software exponga interfaces legibles por agentes." },
		reasons: {
			en: ["Andrej Karpathy — OpenAI founding team and former Tesla AI director — is one of the field's most recognized voices on how LLM-based software is built and run.", "Motivates the design of an agent loop: partial autonomy, keeping a human in the loop, and exposing agent-readable interfaces (APIs and markdown over human-only docs).", "A broad 'Software 3.0' framing that supports the loop concept rather than teaching its mechanics step by step — best as a companion, not a standalone tutorial."],
			es: ["Andrej Karpathy — del equipo fundador de OpenAI y exdirector de IA en Tesla — es una de las voces más reconocidas sobre cómo se construye y opera el software basado en LLMs.", "Motiva el diseño de un agent loop: autonomía parcial, mantener un humano en el bucle y exponer interfaces legibles por agentes (APIs y markdown en lugar de documentación solo para humanos).", "Es un encuadre amplio de 'Software 3.0' que respalda el concepto del bucle en vez de enseñar su mecánica paso a paso; funciona mejor como complemento que como tutorial autónomo."],
		},
	},
	{
		slug: "retrieval",
		url: "https://www.youtube.com/watch?v=mE7IDf2SmJg",
		youtubeId: "mE7IDf2SmJg",
		title: "Stanford CS25: V3 I Retrieval Augmented Language Models",
		author: "Douwe Kiela (Contextual AI; Stanford) — Stanford CS25 / Stanford Online",
		tier: "essential",
		why: { en: "A Stanford CS25 lecture by the senior author of the original RAG paper, covering why parametric language models fall short on knowledge tasks and how retrieval addresses it.", es: "Una clase de Stanford CS25 impartida por el autor principal del paper original de RAG, que explica por qué los modelos de lenguaje paramétricos fallan en tareas de conocimiento y cómo lo resuelve la recuperación." },
		reasons: {
			en: ["Douwe Kiela is the senior author of the 2020 paper that coined Retrieval-Augmented Generation, CEO of Contextual AI, and former Head of Research at Hugging Face.", "Maps the conceptual core of retrieval: the limits of parametric memory, retrieval as the fix, the design space, and the open problems.", "From 2023, so the foundations hold in 2026, though it predates some later system-specific advances."],
			es: ["Douwe Kiela es el autor principal del paper de 2020 que acuñó Retrieval-Augmented Generation, CEO de Contextual AI y ex-Head of Research en Hugging Face.", "Cubre el núcleo conceptual de la recuperación: los límites de la memoria paramétrica, la recuperación como solución, el espacio de diseño y los problemas abiertos.", "Es de 2023, así que sus fundamentos siguen vigentes en 2026, aunque es anterior a algunos avances posteriores específicos de cada sistema."],
		},
	},
	{
		slug: "memory",
		url: "https://www.youtube.com/watch?v=R0OdB-p-ns4",
		youtubeId: "R0OdB-p-ns4",
		title: "AI Dev 25 | Harrison Chase: Long Term Memory with LangGraph",
		author: "Harrison Chase (Co-founder & CEO, LangChain) — DeepLearning.AI AI Dev 25",
		tier: "recommended",
		why: { en: "A LangChain founder's conference talk that frames long-term agent memory as semantic, episodic, and procedural stores — the conceptual model for how agents remember and adapt across sessions.", es: "Una charla de un fundador de LangChain que plantea la memoria a largo plazo de los agentes como almacenes semántico, episódico y procedimental: el modelo conceptual de cómo los agentes recuerdan y se adaptan entre sesiones." },
		reasons: {
			en: ["Harrison Chase is co-founder and CEO of LangChain/LangGraph, presenting his own framework's memory model.", "Teaches the core memory taxonomy — semantic, episodic, and procedural — and the persistent stores that let agents learn over time.", "Caveat: framing is LangGraph-specific, so it pairs best as a companion to a framework-neutral treatment of memory."],
			es: ["Harrison Chase es cofundador y CEO de LangChain/LangGraph, y presenta el modelo de memoria de su propio framework.", "Enseña la taxonomía central de la memoria — semántica, episódica y procedimental — y los almacenes persistentes que permiten a los agentes aprender con el tiempo.", "Salvedad: el enfoque es específico de LangGraph, así que funciona mejor como complemento de un tratamiento neutral respecto al framework."],
		},
	},
	{
		slug: "memory",
		url: "https://www.youtube.com/watch?v=mR-WAvEPRwE",
		youtubeId: "mR-WAvEPRwE",
		title: "Anthropic Workshop: Build Agents That Run for Hours (Without Losing the Plot) — Ash Prabaker & Andrew Wilson",
		author: "Ash Prabaker & Andrew Wilson (Anthropic), at AI Engineer World's Fair",
		tier: "recommended",
		why: { en: "Two Anthropic engineers show how to keep an agent coherent across many context windows, diagnosing context rot and compaction failures and contrasting naive compaction with structured handoffs.", es: "Dos ingenieros de Anthropic muestran cómo mantener a un agente coherente a través de muchas ventanas de contexto, diagnosticando el context rot y los fallos de compactación, y contrastando la compactación ingenua con los handoffs estructurados." },
		reasons: {
			en: ["Ash Prabaker and Andrew Wilson are Anthropic engineers presenting Anthropic's own work on long-running agents, echoing its 'Effective harnesses for long-running agents' writeup.", "Goes to the practical core of agent memory: sustaining state across multiple context windows via compaction versus structured handoffs and cross-run memory management.", "Recorded May 2026 and current as of mid-2026, referencing Opus 4.6 and a year-long model and harness co-evolution arc."],
			es: ["Ash Prabaker y Andrew Wilson son ingenieros de Anthropic que presentan el trabajo de la propia Anthropic sobre agentes de larga duración, en línea con su artículo 'Effective harnesses for long-running agents'.", "Llega al núcleo práctico de la memoria del agente: sostener el estado a través de varias ventanas de contexto mediante compactación frente a handoffs estructurados y gestión de memoria entre ejecuciones.", "Grabado en mayo de 2026 y vigente a mediados de 2026, hace referencia a Opus 4.6 y a un año de coevolución entre modelo y harness."],
		},
	},
	{
		slug: "human-in-the-loop",
		url: "https://www.youtube.com/watch?v=egSh4TxS5go",
		youtubeId: "egSh4TxS5go",
		title: "Ambient Agents and the New Agent Inbox ft. Harrison Chase",
		author: "Harrison Chase (Co-Founder & CEO, LangChain) — Sequoia AI Ascent 2025",
		tier: "essential",
		why: { en: "A canonical talk on the human-in-the-loop patterns ambient agents need — approving, editing, answering, and reviewing proposed actions — from the founder whose team built the agent inbox.", es: "Una charla canónica sobre los patrones human-in-the-loop que necesitan los agentes ambientales — aprobar, editar, responder y revisar acciones propuestas — del fundador cuyo equipo construyó el agent inbox." },
		reasons: {
			en: ["Harrison Chase is co-founder and CEO of LangChain, whose team built the agent inbox and LangGraph's interrupt/approve/edit human-in-the-loop primitives.", "Its core thesis — ambient does not mean fully autonomous — names the exact oversight patterns this module covers: approve, edit, answer, review.", "Recorded at Sequoia AI Ascent 2025; the approve/edit/answer/review vocabulary it introduced is still the standard framing in 2026."],
			es: ["Harrison Chase es cofundador y CEO de LangChain, cuyo equipo construyó el agent inbox y las primitivas human-in-the-loop de interrumpir/aprobar/editar de LangGraph.", "Su tesis central — ambiente no significa totalmente autónomo — nombra los patrones de supervisión exactos que cubre este módulo: aprobar, editar, responder, revisar.", "Grabada en Sequoia AI Ascent 2025; el vocabulario aprobar/editar/responder/revisar que introdujo sigue siendo el marco estándar en 2026."],
		},
	},
	{
		slug: "security",
		url: "https://media.ccc.de/v/39c3-agentic-probllms-exploiting-ai-computer-use-and-coding-agents",
		youtubeId: null,
		title: "Agentic ProbLLMs: Exploiting AI Computer-Use and Coding Agents",
		author: "Johann Rehberger (39C3 / Chaos Computer Club)",
		tier: "essential",
		why: { en: "A frontline red-team demonstration of real prompt-injection attacks against production coding and computer-use agents, showing zero-click data exfiltration and remote code execution.", es: "Una demostracion de red team en primera linea de ataques reales de prompt injection contra agentes de codigo y de computer-use en produccion, con exfiltracion de datos sin clics y ejecucion remota de codigo." },
		reasons: {
			en: ["Johann Rehberger (Embrace the Red) is a leading agent-security researcher, former red-team lead at Microsoft Azure and Uber, who disclosed 24+ agentic-coding vulnerabilities.", "Covers the module's core threat model: indirect prompt injection, RCE, token exfiltration, and failures in sandboxing and human-in-the-loop controls.", "Recorded at 39C3 in December 2025, so the attack surfaces and defenses it shows are current for 2026."],
			es: ["Johann Rehberger (Embrace the Red) es un investigador destacado en seguridad de agentes, ex lider de red team en Microsoft Azure y Uber, que divulgo mas de 24 vulnerabilidades en agentes de codigo.", "Cubre el modelo de amenazas central del modulo: prompt injection indirecto, RCE, exfiltracion de tokens y fallos en sandboxing y controles human-in-the-loop.", "Grabado en el 39C3 en diciembre de 2025, asi que las superficies de ataque y defensas que muestra siguen vigentes en 2026."],
		},
	},
	{
		slug: "security",
		url: "https://www.youtube.com/watch?v=FgxwCaL6UTA",
		youtubeId: "FgxwCaL6UTA",
		title: "Prompt Injection, explained",
		author: "Simon Willison",
		tier: "essential",
		why: { en: "The canonical entry-point explainer on prompt injection, given by the person who coined the term — a clear foundation for the security module's core threat model.", es: "El explicador introductorio de referencia sobre prompt injection, a cargo de quien acuñó el término: una base clara para el modelo de amenazas central de este módulo de seguridad." },
		reasons: {
			en: ["Simon Willison coined the term 'prompt injection' in 2022 and is one of the most-cited independent voices on LLM application security.", "Explains why models cannot reliably separate trusted instructions from untrusted input, and why naive filtering defenses fail.", "A focused ~12-minute introduction; the framing still holds in 2026 and was later extended by his 'lethal trifecta' work."],
			es: ["Simon Willison acuñó el término 'prompt injection' en 2022 y es una de las voces independientes más citadas sobre seguridad de aplicaciones con LLM.", "Explica por qué los modelos no pueden separar de forma fiable las instrucciones confiables de la entrada no confiable, y por qué el filtrado ingenuo falla.", "Una introducción concisa de unos 12 minutos; el enfoque sigue vigente en 2026 y luego lo amplió con su trabajo sobre la 'lethal trifecta'."],
		},
	},
	{
		slug: "evaluation",
		url: "https://www.youtube.com/watch?v=eLXF0VojuSs",
		youtubeId: "eLXF0VojuSs",
		title: "How to Construct Domain Specific LLM Evaluation Systems",
		author: "Hamel Husain (Parlance Labs) & Emil Sedgh (Rechat)",
		tier: "essential",
		why: { en: "A conference walkthrough of building a real domain-specific LLM evaluation system — error analysis, the three eval levels, and the eval flywheel — demonstrated on a production agent.", es: "Un recorrido de conferencia sobre cómo construir un sistema de evaluación de LLM específico para un dominio: análisis de errores, los tres niveles de evals y el flywheel de evals, mostrado sobre un agente en producción." },
		reasons: {
			en: ["Hamel Husain (Parlance Labs) is among the most recognized practitioners on LLM evaluation — author of 'Your AI Product Needs Evals' and a 4,500+ student evals course.", "Teaches a concrete methodology: error analysis, the three eval levels (assertions/unit tests, LLM-as-judge plus human review, A/B tests), and the eval flywheel.", "Grounded in a real shipped product — co-presenter Emil Sedgh (CTO, Rechat) demonstrates it on the Lucy real-estate agent, not a toy benchmark; the methodology-first approach stays current."],
			es: ["Hamel Husain (Parlance Labs) es uno de los profesionales más reconocidos en evaluación de LLM — autor de 'Your AI Product Needs Evals' y de un curso de evals con más de 4,500 alumnos.", "Enseña una metodología concreta: análisis de errores, los tres niveles de evals (assertions/unit tests, LLM-as-judge con revisión humana, A/B tests) y el flywheel de evals.", "Apoyado en un producto real ya lanzado — el coponente Emil Sedgh (CTO de Rechat) lo demuestra sobre el agente inmobiliario Lucy, no un benchmark de juguete; al ser una metodología, sigue vigente."],
		},
	},
	{
		slug: "reasoning",
		url: "https://www.youtube.com/watch?v=ddd4xjuJTyg",
		youtubeId: "ddd4xjuJTyg",
		title: "Scaling Test Time Compute to Multi-Agent Civilizations — Noam Brown, OpenAI",
		author: "Noam Brown (OpenAI), interviewed by swyx & Alessio Fanelli on the Latent Space podcast",
		tier: "essential",
		why: { en: "A conversation with the OpenAI researcher behind o1 on why test-time compute and System-2 reasoning work — the conceptual heart of what this module teaches.", es: "Una conversación con el investigador de OpenAI detrás de o1 sobre por qué funcionan el test-time compute y el razonamiento System-2: el núcleo conceptual de lo que enseña este módulo." },
		reasons: {
			en: ["Noam Brown is a core OpenAI reasoning researcher, credited on the o1 launch and System Card and a lead on test-time compute scaling.", "Covers System-1 vs System-2 thinking, the test-time-compute scaling argument, and multi-agent reasoning, straight from the person who built it.", "The framing of reasoning and inference-time scaling is foundational rather than version-bound, so it remains accurate in 2026."],
			es: ["Noam Brown es un investigador clave de razonamiento en OpenAI, acreditado en el lanzamiento de o1 y su System Card, y referente del escalado de test-time compute.", "Cubre el pensamiento System-1 frente a System-2, el argumento del escalado de test-time compute y el razonamiento multiagente, directamente de quien lo construyó.", "El planteamiento del razonamiento y del escalado en inferencia es fundacional, no atado a una versión, así que sigue siendo válido en 2026."],
		},
	},
	{
		slug: "reasoning",
		url: "https://www.youtube.com/watch?v=kYWUEV_e2ss",
		youtubeId: "kYWUEV_e2ss",
		title: "MIT EI Seminar — Don't teach. Incentivize: A scale-first view of large language models",
		author: "Hyung Won Chung (OpenAI; foundational contributor to o1)",
		tier: "essential",
		why: { en: "A foundational o1 contributor explains the core idea behind modern reasoning models: you incentivize general reasoning to emerge through scale and RL rather than hand-teaching each skill.", es: "Un contribuyente fundamental de o1 explica la idea central detrás de los modelos de razonamiento modernos: incentivar que el razonamiento general emerja mediante escala y RL en vez de enseñar cada habilidad a mano." },
		reasons: {
			en: ["Hyung Won Chung was a foundational contributor to OpenAI's o1, their first reasoning models, and focuses his research on reasoning and agents.", "Lays out the scale-first mental model: incentivize emergent general skills through scale and reinforcement learning instead of enumerating and teaching each one.", "A conceptual framing talk rather than a tooling walkthrough, so the core argument still holds up against newer frontier models."],
			es: ["Hyung Won Chung fue un contribuyente fundamental de o1 de OpenAI, sus primeros modelos de razonamiento, y centra su investigación en razonamiento y agentes.", "Plantea el modelo mental scale-first: incentivar habilidades generales emergentes mediante escala y reinforcement learning en vez de enumerar y enseñar cada una.", "Es una charla conceptual y no un recorrido de herramientas, así que su argumento central sigue vigente frente a modelos más recientes."],
		},
	},
	{
		slug: "observability",
		url: "https://www.youtube.com/watch?v=PgzOBNse2EA",
		youtubeId: "PgzOBNse2EA",
		title: "Evals, error analysis, and better prompts: A systematic approach to improving your AI products",
		author: "Hamel Husain (guest), hosted by Claire Vo on the How I AI podcast",
		tier: "recommended",
		why: { en: "Hamel Husain demonstrates a systematic workflow for improving AI products: categorizing real production failures from traces, annotating them, and turning recurring errors into binary evals.", es: "Hamel Husain muestra un flujo de trabajo sistemático para mejorar productos de IA: clasificar fallos reales de producción a partir de trazas, anotarlos y convertir los errores recurrentes en evals binarios." },
		reasons: {
			en: ["Hamel Husain co-created one of the most popular AI-evals courses and is co-authoring O'Reilly's 'Evals for AI Engineers'; he has trained engineering teams at OpenAI and Anthropic.", "Teaches error analysis on production traces — annotating failures and converting them into eval cases — the methodology core of observability.", "Grounded in a real product (Nurture Boss); it covers the eval/error-analysis side of observability rather than the tracing-stack tooling, so pair it with infrastructure material."],
			es: ["Hamel Husain co-creó uno de los cursos de evals de IA más populares y co-escribe 'Evals for AI Engineers' de O'Reilly; ha formado equipos de ingeniería en OpenAI y Anthropic.", "Enseña análisis de errores sobre trazas de producción —anotar fallos y convertirlos en casos de eval—, el núcleo metodológico de la observabilidad.", "Se basa en un producto real (Nurture Boss); cubre el lado de evals y análisis de errores de la observabilidad, no el del tooling de tracing, así que conviene complementarlo con material de infraestructura."],
		},
	},
	{
		slug: "production",
		url: "https://www.infoq.com/presentations/distributed-systems-resiliency/",
		youtubeId: null,
		title: "Timeouts, Retries and Idempotency In Distributed Systems",
		author: "Sam Newman",
		tier: "recommended",
		why: { en: "It teaches the three failure-handling primitives an agent's production tool and API calls must get right: timeouts, safe retries with jitter, and idempotency keys to avoid duplicate side effects.", es: "Enseña las tres primitivas de manejo de fallos que las llamadas a herramientas y APIs de un agente deben acertar en producción: timeouts, reintentos seguros con jitter y claves de idempotencia para evitar efectos secundarios duplicados." },
		reasons: {
			en: ["Sam Newman popularized the term 'microservices' and wrote O'Reilly's Building Microservices and Building Resilient Distributed Systems — a recognized authority on distributed-systems resilience.", "Structured around timeouts, retries (limits, delay, jitter), and idempotency (request IDs, server-side fingerprinting) — the core reliability concerns for an agent's outbound calls.", "Recorded in 2025 with data-driven, framework-agnostic guidance (histograms for timeouts, jitter for retries) that stays accurate and isn't tied to deprecated tooling."],
			es: ["Sam Newman popularizó el término 'microservicios' y escribió Building Microservices y Building Resilient Distributed Systems de O'Reilly — una autoridad reconocida en resiliencia de sistemas distribuidos.", "Estructurada en torno a timeouts, reintentos (límites, retraso, jitter) e idempotencia (IDs de petición, fingerprinting en el servidor) — las preocupaciones clave de fiabilidad para las llamadas salientes de un agente.", "Grabada en 2025 con guía basada en datos e independiente de frameworks (histogramas para timeouts, jitter para reintentos) que sigue siendo precisa y no depende de herramientas obsoletas."],
		},
	},
	{
		slug: "production",
		url: "https://www.youtube.com/watch?v=V_5WeVmyhzg",
		youtubeId: "V_5WeVmyhzg",
		title: "Workflows, a new abstraction for distributed systems",
		author: "Dominik Tornow (Strange Loop 2022)",
		tier: "recommended",
		why: { en: "It explains the durable-workflow abstraction — pushing fault-tolerance into the platform so you can code as if failure doesn't exist — the core concern when orchestrating long-running, interruptible agents.", es: "Explica la abstracción de los workflows durables — delegar la tolerancia a fallos en la plataforma para programar como si los fallos no existieran — la preocupación central al orquestar agentes interrumpibles de larga duración." },
		reasons: {
			en: ["Dominik Tornow was a Principal Engineer at Temporal, the leading durable-execution platform, and now founds Resonate HQ; he authored Manning's Think Distributed Systems.", "Teaches durable execution as the production reliability primitive beneath agent runtimes: pushing retries, timeouts, and recovery into the platform itself.", "Conceptual and framework-agnostic — from 2022 but the durable-workflow framing has aged well as the substrate for reliable agent orchestration."],
			es: ["Dominik Tornow fue Principal Engineer en Temporal, la principal plataforma de ejecución durable, y ahora dirige Resonate HQ; escribió Think Distributed Systems de Manning.", "Enseña la ejecución durable como la primitiva de fiabilidad en producción que sustenta los runtimes de agentes: delegar reintentos, timeouts y recuperación en la propia plataforma.", "Es conceptual e independiente de frameworks — de 2022, pero el enfoque de workflows durables ha envejecido bien como base para orquestar agentes de forma fiable."],
		},
	},
	{
		slug: "post-training-rl",
		url: "https://www.youtube.com/watch?v=7xTGNNLPyMI",
		youtubeId: "7xTGNNLPyMI",
		title: "Deep Dive into LLMs like ChatGPT",
		author: "Andrej Karpathy",
		tier: "essential",
		why: { en: "Karpathy walks through the full post-training stack — SFT, reinforcement learning, RLHF, reward models, and DeepSeek-R1-style RL reasoning — a direct primer for this module's topic.", es: "Karpathy recorre todo el stack de post-training — SFT, aprendizaje por refuerzo, RLHF, reward models y razonamiento por RL al estilo DeepSeek-R1 — un primer directo sobre el tema de este módulo." },
		reasons: {
			en: ["Andrej Karpathy is an OpenAI founding member and former Tesla AI director, known for rigorous, clear teaching on LLMs and RL.", "Dedicated chapters take you from pretraining to post-training, SFT to RL, reward models, RLHF, and DeepSeek-R1-style RL reasoning.", "The SFT, RL, reward-model, and RLHF concepts remain foundational, so the material still holds in 2026."],
			es: ["Andrej Karpathy es miembro fundador de OpenAI y exdirector de IA en Tesla, reconocido por enseñar LLMs y RL con rigor y claridad.", "Capítulos dedicados te llevan del pretraining al post-training, de SFT a RL, reward models, RLHF y razonamiento por RL al estilo DeepSeek-R1.", "Los conceptos de SFT, RL, reward models y RLHF siguen siendo fundamentales, así que el material sigue vigente en 2026."],
		},
	},
	{
		slug: "post-training-rl",
		url: "https://www.youtube.com/watch?v=o6l6tJQgUg4",
		youtubeId: "o6l6tJQgUg4",
		title: "RLHF and Post-training Overview | RLHF & Post-Training Book Course, Lecture 1",
		author: "Nathan Lambert (Allen Institute for AI)",
		tier: "essential",
		why: { en: "The opening lecture of Nathan Lambert's RLHF & Post-Training course gives a current, authoritative overview of how modern LLMs are post-trained with RLHF — the exact scope of this module.", es: "La lección inicial del curso de RLHF y post-training de Nathan Lambert ofrece una visión actual y rigurosa de cómo se hace el post-training de los LLM modernos con RLHF, justo el alcance de este módulo." },
		reasons: {
			en: ["Taught by Nathan Lambert, a post-training and RLHF researcher at the Allen Institute for AI (OLMo, Tulu, TRL) and author of the RLHF Book.", "Maps directly onto the module: an overview of RLHF and post-training drawn from the book's first chapters, not an adjacent topic.", "Published in 2026 to accompany the book, so it reflects present-day post-training practice rather than outdated methods."],
			es: ["Impartida por Nathan Lambert, investigador de post-training y RLHF en el Allen Institute for AI (OLMo, Tulu, TRL) y autor del RLHF Book.", "Corresponde directamente al módulo: una visión general de RLHF y post-training basada en los primeros capítulos del libro, no un tema colateral.", "Publicada en 2026 junto al libro, por lo que refleja la práctica actual de post-training y no métodos obsoletos."],
		},
	},
	{
		slug: "frontier",
		url: "https://www.youtube.com/watch?v=9QSm_mRGpN8",
		youtubeId: "9QSm_mRGpN8",
		title: "Measuring Exponential Trends Rising (in AI) — Joel Becker, METR",
		author: "Joel Becker (METR), co-author of \"Measuring AI Ability to Complete Long Tasks\"",
		tier: "essential",
		why: { en: "A METR co-author presents the team's central finding: the length of tasks AI agents can finish on their own has been doubling at a steady cadence.", es: "Un coautor de METR presenta el hallazgo central del equipo: la duración de las tareas que los agentes de IA logran completar de forma autónoma se ha duplicado a un ritmo constante." },
		reasons: {
			en: ["Joel Becker is a credited co-author of METR's \"Measuring AI Ability to Complete Long Tasks,\" speaking directly for the work rather than summarizing it secondhand.", "Explains the time-horizon metric METR defined and the exponential trend in how long agents can work unsupervised — the exact frontier-trajectory idea this module covers.", "A 2026 talk that reflects post-publication updates (a faster doubling cadence and recent frontier models), so it is more current than the original March 2025 paper alone."],
			es: ["Joel Becker es coautor acreditado del paper de METR \"Measuring AI Ability to Complete Long Tasks\" y habla en nombre del trabajo, no lo resume de segunda mano.", "Explica la métrica de time-horizon que definió METR y la tendencia exponencial en cuánto tiempo pueden trabajar los agentes sin supervisión, justo la idea de trayectoria de frontera que cubre este módulo.", "Es una charla de 2026 que incorpora actualizaciones posteriores a la publicación (un ritmo de duplicación más rápido y modelos de frontera recientes), por lo que está más actualizada que solo leer el paper original de marzo de 2025."],
		},
	},
	{
		slug: "frontier",
		url: "https://www.youtube.com/watch?v=lXUZvyajciY",
		youtubeId: "lXUZvyajciY",
		title: "Andrej Karpathy — AGI is still a decade away",
		author: "Dwarkesh Patel (guest: Andrej Karpathy)",
		tier: "essential",
		why: { en: "In this interview Karpathy argues that building robust AI agents is a decade-long engineering problem, giving a grounded read on where agentic systems actually stand today.", es: "En esta entrevista Karpathy sostiene que construir agentes de IA fiables es un problema de ingeniería que tomará una década, ofreciendo una lectura realista de dónde están hoy los sistemas agénticos." },
		reasons: {
			en: ["Karpathy is an OpenAI founding member and former Tesla AI director who coined the phrase 'the decade of agents' — a leading voice on this topic.", "Lays out the real gap between today's agents and AGI, and the bottlenecks that define it: RL limits, continual learning, and reliability.", "Recorded October 2025 and still accurate in mid-2026; its timelines and capability claims have held up."],
			es: ["Karpathy es miembro fundador de OpenAI y exdirector de IA en Tesla, y acuñó la frase 'la década de los agentes' — una voz de referencia en este tema.", "Expone la brecha real entre los agentes actuales y la AGI, y los cuellos de botella que la definen: límites del RL, aprendizaje continuo y fiabilidad.", "Grabado en octubre de 2025 y aún vigente a mediados de 2026; sus plazos y afirmaciones sobre capacidades se han sostenido."],
		},
	},
];

/** Videos for one module, in curated order. */
export function getVideosForModule(slug: string): LearnVideo[] {
	return LEARN_VIDEOS.filter((v) => v.slug === slug);
}

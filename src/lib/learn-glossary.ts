// Master glossary for the agentic-systems course: field terms a newcomer needs,
// extracted from all 16 modules, consolidated, and translated. Powers the
// /learn/agentic-systems/glossary page and the inline <Term> tooltips.

export type Lang = 'en' | 'es';

export interface GlossaryTerm {
	term: string;
	slug: string;
	def: { en: string; es: string };
}

export const GLOSSARY: GlossaryTerm[] = [
	{
		term: "(θ, C) pair",
		slug: "c-pair",
		def: { en: "Framing an agent as fixed model weights θ (set at training) plus runtime context/memory C; in modern agents 'learning' updates C in token-space rather than retraining θ.", es: "Plantear un agente como pesos fijos del modelo θ (definidos en el entrenamiento) más el contexto/memoria de runtime C; en los agentes modernos el 'aprendizaje' actualiza C en el espacio de tokens en lugar de reentrenar θ." },
	},
	{
		term: "A2A (Agent2Agent)",
		slug: "a2a-agent2agent",
		def: { en: "An emerging horizontal interoperability standard that connects agents to each other via Agent Cards, JSON-RPC, and SSE — complementing MCP's vertical agent-to-tool connection.", es: "Un estándar emergente de interoperabilidad horizontal que conecta agentes entre sí mediante Agent Cards, JSON-RPC y SSE, complementando la conexión vertical agente-herramienta de MCP." },
	},
	{
		term: "Action space",
		slug: "action-space",
		def: { en: "The complete set of actions an agent can take — in an LLM agent, its available tools; restricting it lowers policy variance and shrinks the attack surface.", es: "El conjunto completo de acciones que un agente puede tomar —en un agente LLM, sus herramientas disponibles—; restringirlo reduce la varianza de la política y disminuye la superficie de ataque." },
	},
	{
		term: "Agent control loop",
		slug: "agent-control-loop",
		def: { en: "The repeating cycle where a model decides an action, the harness executes it against the environment, and the resulting observation is fed back for the next decision until a stopping condition is met.", es: "El ciclo que se repite en el que el modelo decide una acción, el harness la ejecuta contra el entorno y la observación resultante se realimenta para la siguiente decisión, hasta que se cumple una condición de parada." },
	},
	{
		term: "Agent-Computer Interface (ACI)",
		slug: "agent-computer-interface-aci",
		def: { en: "The design of the tools an agent can call — names, formats, examples, error-proofing — effectively the design of the POMDP's action space and a major reliability lever.", es: "El diseño de las herramientas que un agente puede invocar —nombres, formatos, ejemplos, prevención de errores—, que es en la práctica el diseño del action space del POMDP y una palanca importante de fiabilidad." },
	},
	{
		term: "Agentic search",
		slug: "agentic-search",
		def: { en: "Retrieval done in a loop at runtime: the model uses tools (grep, read, SQL, APIs) to navigate a corpus, reads current data, and reformulates its next query from what it just found, with no precomputed index.", es: "Recuperación realizada en un bucle en runtime: el modelo usa herramientas (grep, read, SQL, APIs) para navegar un corpus, lee datos actuales y reformula su siguiente consulta a partir de lo que acaba de encontrar, sin ningún índice precomputado." },
	},
	{
		term: "Agents Rule of Two",
		slug: "agents-rule-of-two",
		def: { en: "Meta's design guideline that an autonomous agent (no human in the loop) may hold at most two of three properties: processes untrusted input, accesses sensitive data, or can change state/communicate externally.", es: "La pauta de diseño de Meta según la cual un agente autónomo (sin humano en el bucle) puede tener como máximo dos de tres propiedades: procesar entrada no confiable, acceder a datos sensibles, o poder cambiar el estado/comunicarse externamente." },
	},
	{
		term: "AST matching",
		slug: "ast-matching",
		def: { en: "Comparing the abstract syntax tree of a model's generated function call against a reference call to verify name, parameters, and types without executing code or invoking an LLM.", es: "Comparar el árbol de sintaxis abstracta de la llamada a función generada por un modelo contra una llamada de referencia para verificar nombre, parámetros y tipos sin ejecutar código ni invocar a un LLM." },
	},
	{
		term: "At-least-once delivery",
		slug: "at-least-once-delivery",
		def: { en: "The realistic guarantee of distributed queues: a message may be delivered more than once (e.g., a worker finishes but crashes before acknowledging), which is why consumers must be idempotent.", es: "La garantía realista de las colas distribuidas: un mensaje puede entregarse más de una vez (por ejemplo, un worker termina pero se cae antes de confirmar), razón por la cual los consumidores deben ser idempotentes." },
	},
	{
		term: "Attack Success Rate (ASR)",
		slug: "attack-success-rate-asr",
		def: { en: "The fraction of attack attempts that achieve the adversary's goal against an agent — a benchmark metric (e.g., in AgentDojo) measuring security under attack rather than just task success.", es: "La fracción de intentos de ataque que logran el objetivo del adversario contra un agente; una métrica de benchmark (por ejemplo, en AgentDojo) que mide la seguridad bajo ataque en lugar de solo el éxito en la tarea." },
	},
	{
		term: "Attention / O(n²)",
		slug: "attention-o-n2",
		def: { en: "The transformer mechanism that relates every token to every other token; because it is all-pairs, prefill compute grows quadratically with context length.", es: "El mecanismo del transformer que relaciona cada token con todos los demás; al ser de todos contra todos, el cómputo del prefill crece de forma cuadrática con la longitud del contexto." },
	},
	{
		term: "Attention budget",
		slug: "attention-budget",
		def: { en: "The idea that a transformer has a finite, degradable capacity to attend across tokens, so context tokens are a scarce resource to spend rather than free storage.", es: "La idea de que un transformer tiene una capacidad finita y degradable para atender a través de los tokens, por lo que los tokens de contexto son un recurso escaso que se gasta, no almacenamiento gratuito." },
	},
	{
		term: "Augmented LLM",
		slug: "augmented-llm",
		def: { en: "Anthropic's basic building block of agentic systems: a model enhanced with augmentations like retrieval, tools, and memory, exposed to it through an easy, well-documented interface. Workflows and agents are both built on this unit, not on the raw model.", es: "El bloque básico de construcción de los sistemas agénticos según Anthropic: un modelo enriquecido con aumentaciones como recuperación, herramientas y memoria, expuestas mediante una interfaz sencilla y bien documentada. Tanto los workflows como los agentes se construyen sobre esta unidad, no sobre el modelo en bruto." },
	},
	{
		term: "Automation bias / overreliance",
		slug: "automation-bias-overreliance",
		def: { en: "The tendency of human approvers to rubber-stamp AI outputs without genuine scrutiny, eroding the safety value of a human-in-the-loop even when people are trained to resist it.", es: "La tendencia de los aprobadores humanos a validar sin reservas las salidas de la IA sin un escrutinio genuino, erosionando el valor de seguridad de un human-in-the-loop incluso cuando se entrena a las personas para resistirlo." },
	},
	{
		term: "Batch invariance",
		slug: "batch-invariance",
		def: { en: "The property (usually absent in default GPU kernels) that an inference result is independent of the batch size it was computed in; its absence is why identical inputs can yield different outputs even at temperature 0.", es: "La propiedad (normalmente ausente en los kernels de GPU por defecto) de que el resultado de una inferencia sea independiente del tamaño de batch en que se computó; su ausencia explica por qué entradas idénticas pueden producir salidas distintas incluso a temperatura 0." },
	},
	{
		term: "Belief state",
		slug: "belief-state",
		def: { en: "The agent's running estimate of the hidden world state formed from observations; in an LLM agent this is the curated context window, not the raw prompt.", es: "La estimación continua que el agente mantiene del estado oculto del mundo formada a partir de las observaciones; en un agente LLM es el context window curado, no el prompt en bruto." },
	},
	{
		term: "Benchmark contamination / saturation",
		slug: "benchmark-contamination-saturation",
		def: { en: "Contamination is benchmark solutions leaking into training data (inflating scores via memorization); saturation is frontier models all scoring near the ceiling, so the benchmark no longer discriminates.", es: "La contaminación es la filtración de las soluciones de un benchmark en los datos de entrenamiento (inflando los puntajes por memorización); la saturación es cuando los modelos de frontera puntúan todos cerca del techo, de modo que el benchmark deja de discriminar." },
	},
	{
		term: "Best-of-N with a verifier",
		slug: "best-of-n-with-a-verifier",
		def: { en: "Generating N candidate answers and selecting the best using an external truth signal (a test, a search, a checker), which beats blind majority voting at lower token cost.", es: "Generar N respuestas candidatas y seleccionar la mejor usando una señal de verdad externa (un test, una búsqueda, un verificador), lo que supera a la votación por mayoría a ciegas con un menor costo de tokens." },
	},
	{
		term: "BFCL (Berkeley Function Calling Leaderboard)",
		slug: "bfcl-berkeley-function-calling-leaderboard",
		def: { en: "A standard benchmark for how accurately LLMs call functions/tools, including irrelevance detection (knowing when not to call) and, in V4, agentic skills like multi-hop web search and memory.", es: "Un benchmark estándar sobre con qué precisión los LLM llaman a funciones/herramientas, que incluye la detección de irrelevancia (saber cuándo no llamar) y, en su V4, habilidades agénticas como la búsqueda web de varios saltos y la memoria." },
	},
	{
		term: "Blast radius",
		slug: "blast-radius",
		def: { en: "How many systems, users, or records an action affects if it goes wrong — used alongside reversibility to decide whether an action needs human confirmation.", es: "Cuántos sistemas, usuarios o registros afecta una acción si sale mal, usado junto con la reversibilidad para decidir si una acción necesita confirmación humana." },
	},
	{
		term: "BM25",
		slug: "bm25",
		def: { en: "A classic lexical ranking function scoring documents by exact term matches; strong on identifiers, codes, and symbols but weak on pure synonyms.", es: "Una función clásica de ranking léxico que puntúa documentos según coincidencias exactas de términos; fuerte en identificadores, códigos y símbolos, pero débil con sinónimos puros." },
	},
	{
		term: "bypassPermissions mode",
		slug: "bypasspermissions-mode",
		def: { en: "A permissive Agent SDK mode that auto-approves tool calls, but where deny rules and ask rules still override — so those two remain effective security boundaries even under it.", es: "Un modo permisivo del Agent SDK que aprueba automáticamente las llamadas a herramientas, pero en el que las reglas de denegación y las reglas de pregunta siguen teniendo prioridad, de modo que esas dos permanecen como límites de seguridad efectivos incluso bajo él." },
	},
	{
		term: "Chain-of-thought (CoT)",
		slug: "chain-of-thought-cot",
		def: { en: "Intermediate reasoning tokens a model emits before its final answer; originally a prompting trick, now often trained in, it can improve accuracy on multi-step problems.", es: "Tokens de razonamiento intermedio que el modelo emite antes de su respuesta final; originalmente un truco de prompting y hoy a menudo entrenado, puede mejorar la precisión en problemas de varios pasos." },
	},
	{
		term: "Chunking",
		slug: "chunking",
		def: { en: "Splitting documents into smaller passages before embedding/indexing; it can break coreference and context (e.g., a chunk says 'margin grew 3%' without which company or quarter).", es: "Dividir documentos en pasajes más pequeños antes de hacer embedding/indexación; puede romper la correferencia y el contexto (p. ej., un chunk dice 'el margen creció 3%' sin indicar de qué empresa o trimestre)." },
	},
	{
		term: "Circuit breaker / spend cap",
		slug: "circuit-breaker-spend-cap",
		def: { en: "An infrastructure-level hard limit (max iterations, per-tenant daily token budget, or a breaker that trips on spend-velocity spikes) enforced before the model call, outside the agent's control — not requested in the system prompt.", es: "Un límite rígido a nivel de infraestructura (máximo de iteraciones, presupuesto diario de tokens por tenant, o un breaker que se dispara ante picos de velocidad de gasto) aplicado antes de la llamada al modelo y fuera del control del agente, no algo solicitado en el system prompt." },
	},
	{
		term: "Code execution with MCP",
		slug: "code-execution-with-mcp",
		def: { en: "A pattern where the model writes a program that calls tools in a sandbox, so intermediate results stay out of its context and only the final answer returns — cutting token cost dramatically.", es: "Un patrón en el que el modelo escribe un programa que llama a las herramientas dentro de un sandbox, de modo que los resultados intermedios quedan fuera de su contexto y solo regresa la respuesta final, reduciendo drásticamente el coste en tokens." },
	},
	{
		term: "Code-based grader",
		slug: "code-based-grader",
		def: { en: "A deterministic, rule- or code-driven evaluator (e.g., checking tool order or confirmation gates) that scores agent behavior without an LLM, making it cheap, reproducible, and bias-free.", es: "Un evaluador determinista, basado en reglas o código (p. ej., que verifica el orden de las herramientas o las confirmaciones obligatorias), que puntúa el comportamiento del agente sin un LLM, haciéndolo barato, reproducible y libre de sesgos." },
	},
	{
		term: "Cohen's kappa",
		slug: "cohen-s-kappa",
		def: { en: "An inter-rater agreement statistic that corrects for chance, used to calibrate an LLM judge against human labels, with >0.6 acceptable and >0.8 strong.", es: "Un estadístico de concordancia entre evaluadores que corrige por el azar, usado para calibrar a un LLM juez contra etiquetas humanas, donde >0.6 es aceptable y >0.8 es fuerte." },
	},
	{
		term: "Compaction",
		slug: "compaction",
		def: { en: "A deliberately lossy operation that discards parts of the accumulated context (often old raw tool outputs) while preserving distilled decisions — directed information loss, and also a poisoning channel.", es: "Una operación deliberadamente con pérdida que descarta partes del contexto acumulado (a menudo salidas crudas y antiguas de herramientas) preservando las decisiones destiladas; una pérdida de información dirigida, y también un canal de envenenamiento." },
	},
	{
		term: "Compounding error",
		slug: "compounding-error",
		def: { en: "The phenomenon where small per-step error rates accumulate over a long task, collapsing success probability (heuristically p^t; rigorously a quadratic εT² bound in imitation learning per Ross & Bagnell).", es: "El fenómeno por el cual pequeñas tasas de error por paso se acumulan a lo largo de una tarea larga y hunden la probabilidad de éxito (heurísticamente p^t; rigurosamente una cota cuadrática εT² en aprendizaje por imitación, según Ross y Bagnell)." },
	},
	{
		term: "Confirm/execute non-divergence",
		slug: "confirm-execute-non-divergence",
		def: { en: "The guarantee that the exact normalized input a human approved is byte-for-byte what gets executed, achieved by persisting the validated input before asking and running that stored record rather than a fresh model call.", es: "La garantía de que la entrada normalizada exacta que un humano aprobó es byte a byte lo que se ejecuta, lograda persistiendo la entrada validada antes de preguntar y ejecutando ese registro guardado en lugar de una nueva llamada al modelo." },
	},
	{
		term: "Confused deputy",
		slug: "confused-deputy",
		def: { en: "A classic security flaw where a trusted component with legitimate authority is tricked by a third party into misusing it on the attacker's behalf — here, an agent acting on instructions buried in poisoned data; MCP's OAuth Resource Indicators (RFC 8707) aim to stop tokens being reused across servers.", es: "Un fallo de seguridad clásico en el que un componente de confianza con autoridad legítima es engañado por un tercero para que abuse de ella en beneficio del atacante —aquí, un agente que actúa según instrucciones ocultas en datos envenenados—; los Resource Indicators de OAuth en MCP (RFC 8707) buscan impedir que los tokens se reutilicen entre servidores." },
	},
	{
		term: "Constitutional AI / RLAIF",
		slug: "constitutional-ai-rlaif",
		def: { en: "Anthropic's approach where a model critiques and revises its own outputs against written principles (a constitution) to generate preference data, replacing human labels with AI feedback.", es: "El enfoque de Anthropic en el que un modelo critica y revisa sus propias salidas contra principios escritos (una constitución) para generar datos de preferencia, reemplazando las etiquetas humanas con retroalimentación de la IA." },
	},
	{
		term: "Context engineering",
		slug: "context-engineering",
		def: { en: "Curating the entire token stream fed to an agent each turn (system prompt, history, tool results, retrieved data, memory) so the model has the smallest high-signal set it needs, rather than just writing one good prompt.", es: "Curar todo el flujo de tokens que se le entrega al agente en cada turno (system prompt, historial, resultados de herramientas, datos recuperados, memoria) para que el modelo tenga el conjunto más pequeño y con mayor señal que necesita, en lugar de limitarse a escribir un buen prompt." },
	},
	{
		term: "Context isolation (sub-agents)",
		slug: "context-isolation-sub-agents",
		def: { en: "Spawning a sub-agent with a clean window to do bounded work and return only a small distilled result, keeping the coordinator's context uncontaminated — reliable for read-only tasks but risky for coordinated writes.", es: "Lanzar un sub-agente con una ventana limpia para que haga un trabajo acotado y devuelva solo un pequeño resultado destilado, manteniendo sin contaminar el contexto del coordinador; fiable para tareas de solo lectura pero arriesgado para escrituras coordinadas." },
	},
	{
		term: "Context poisoning",
		slug: "context-poisoning",
		def: { en: "A failure mode where a hallucinated or hostile fact enters the context and gets repeatedly cited in later turns, self-reinforcing until the agent chases a false or impossible goal.", es: "Un modo de fallo en el que un dato alucinado u hostil entra en el contexto y se cita repetidamente en turnos posteriores, autorreforzándose hasta que el agente persigue un objetivo falso o imposible." },
	},
	{
		term: "Context rot",
		slug: "context-rot",
		def: { en: "The empirical finding that an LLM's accuracy degrades non-uniformly as input length grows — even well within the window — so more tokens can make the model reason worse, not just cost more.", es: "El hallazgo empírico de que la precisión de un LLM se degrada de forma no uniforme a medida que crece la longitud de la entrada —incluso muy por dentro de la ventana—, de modo que más tokens pueden hacer que el modelo razone peor, no solo que cueste más." },
	},
	{
		term: "Context window",
		slug: "context-window",
		def: { en: "The finite maximum number of tokens (prompt plus output) the model can attend to in a single call; beyond it, content must be dropped, summarized, or retrieved.", es: "El número máximo finito de tokens (prompt más salida) que el modelo puede atender en una sola llamada; más allá de ese límite, el contenido debe descartarse, resumirse o recuperarse." },
	},
	{
		term: "Context window vs memory",
		slug: "context-window-vs-memory",
		def: { en: "The context window is the volatile token buffer the model sees this turn (lost on compaction/reset); memory is external durable state with explicit write, retrieval, and decay policies that survives across turns and sessions.", es: "La ventana de contexto es el buffer volátil de tokens que el modelo ve en este turno (se pierde al compactar/reiniciar); la memoria es estado externo y duradero con políticas explícitas de escritura, recuperación y decaimiento que persiste entre turnos y sesiones." },
	},
	{
		term: "Contextual Retrieval",
		slug: "contextual-retrieval",
		def: { en: "Anthropic's preprocessing technique that prepends an LLM-generated, document-aware blurb to each chunk before embedding and BM25 indexing, reducing failures from chunks losing their surrounding context.", es: "La técnica de preprocesamiento de Anthropic que antepone a cada chunk una glosa generada por un LLM y consciente del documento, antes del embedding y la indexación BM25, reduciendo los fallos por chunks que pierden su contexto circundante." },
	},
	{
		term: "Continual learning in token-space",
		slug: "continual-learning-in-token-space",
		def: { en: "Improving an agent by accumulating readable textual experience (notes, reflections, memories) rather than fine-tuning weights — interpretable, versionable, and portable across models.", es: "Mejorar un agente acumulando experiencia textual legible (notas, reflexiones, memorias) en lugar de hacer fine-tuning de los pesos: interpretable, versionable y portable entre modelos." },
	},
	{
		term: "Control plane vs execution plane",
		slug: "control-plane-vs-execution-plane",
		def: { en: "An architectural split where a stateless fast edge only validates, persists, and enqueues a request, while a durable slow worker performs the model call and tool execution behind a queue.", es: "Una división arquitectónica en la que un borde rápido y sin estado solo valida, persiste y encola una solicitud, mientras que un worker lento y duradero realiza la llamada al modelo y la ejecución de herramientas detrás de una cola." },
	},
	{
		term: "CoT faithfulness",
		slug: "cot-faithfulness",
		def: { en: "Whether the visible reasoning text actually reflects the computation that produced the answer; research shows it often does not, so CoT is not a reliable audit trail.", es: "Si el texto de razonamiento visible refleja realmente el cómputo que produjo la respuesta; la investigación muestra que a menudo no lo hace, por lo que el CoT no es un registro de auditoría fiable." },
	},
	{
		term: "Credit assignment (sparse reward)",
		slug: "credit-assignment-sparse-reward",
		def: { en: "The problem of deciding which actions in a long trajectory deserve reward when success is only known at the end — addressed with dense per-turn rewards, token-level credit (GAE/TD), and trajectory curation.", es: "El problema de decidir qué acciones de una trajectory larga merecen recompensa cuando el éxito solo se conoce al final, abordado con recompensas densas por turno, crédito a nivel de token (GAE/TD) y curación de trajectories." },
	},
	{
		term: "DAgger (Dataset Aggregation)",
		slug: "dagger-dataset-aggregation",
		def: { en: "Ross, Gordon & Bagnell's 2011 imitation-learning algorithm that mitigates compounding error by training the policy on the states it actually visits, replacing quadratic error growth with a linear O(εT) term.", es: "El algoritmo de aprendizaje por imitación de Ross, Gordon y Bagnell (2011) que mitiga el error acumulado entrenando la política sobre los estados que esta realmente visita, sustituyendo el crecimiento cuadrático del error por un término lineal O(εT)." },
	},
	{
		term: "Darwin Gödel Machine (DGM)",
		slug: "darwin-godel-machine-dgm",
		def: { en: "A self-improving coding agent that rewrites its own code, empirically validates each variant against a benchmark, and keeps an archive of diverse variants to avoid local optima.", es: "Un agente de codificación auto-mejorante que reescribe su propio código, valida empíricamente cada variante contra un benchmark y mantiene un archivo de variantes diversas para evitar óptimos locales." },
	},
	{
		term: "Default-deny / least privilege",
		slug: "default-deny-least-privilege",
		def: { en: "A fail-closed security posture where anything not explicitly permitted is rejected and an agent starts with no capabilities, granted only the specific tools the current task or role requires via an explicit allowlist.", es: "Una postura de seguridad fail-closed en la que todo lo que no esté explícitamente permitido se rechaza y un agente arranca sin capacidades, concediéndosele solo las herramientas específicas que la tarea o el rol actual requieren mediante una allowlist explícita." },
	},
	{
		term: "Digit quantization",
		slug: "digit-quantization",
		def: { en: "The arithmetic errors that come from how a model chops numbers into tokens: byte-pair encoding can group digits inconsistently (e.g. '1234' as '123'+'4'), so the model never sees clean place value and miscalculates. It's a tokenization artifact, not a reasoning failure.", es: "Los errores aritméticos que surgen de cómo el modelo trocea los números en tokens: el byte-pair encoding puede agrupar los dígitos de forma inconsistente (p. ej., '1234' como '123'+'4'), de modo que el modelo nunca ve un valor posicional limpio y calcula mal. Es un artefacto de la tokenización, no un fallo de razonamiento." },
	},
	{
		term: "DPO (Direct Preference Optimization)",
		slug: "dpo-direct-preference-optimization",
		def: { en: "A method reaching the same aligned policy as RLHF by minimizing a classification loss over (preferred, rejected) response pairs, removing the separate reward model and RL loop.", es: "Un método que alcanza la misma política alineada que RLHF minimizando una pérdida de clasificación sobre pares de respuestas (preferida, rechazada), eliminando el modelo de recompensa y el bucle de RL por separado." },
	},
	{
		term: "Dual-LLM / quarantine pattern",
		slug: "dual-llm-quarantine-pattern",
		def: { en: "An architecture where a privileged LLM orchestrates but never reads untrusted text, while a separate quarantined LLM processes untrusted content and returns only typed values (a date, a boolean), never instructions the privileged model obeys.", es: "Una arquitectura en la que un LLM privilegiado orquesta pero nunca lee texto no confiable, mientras que un LLM separado y en cuarentena procesa el contenido no confiable y devuelve solo valores tipados (una fecha, un booleano), nunca instrucciones que el modelo privilegiado obedezca." },
	},
	{
		term: "Dual-write problem",
		slug: "dual-write-problem",
		def: { en: "The inconsistency arising when an application writes to two systems (e.g., a database and a queue) as separate non-atomic operations, so a crash between them leaves a phantom record or a lost message.", es: "La inconsistencia que surge cuando una aplicación escribe en dos sistemas (por ejemplo, una base de datos y una cola) como operaciones separadas no atómicas, de modo que una caída entre ambas deja un registro fantasma o un mensaje perdido." },
	},
	{
		term: "Durable execution",
		slug: "durable-execution",
		def: { en: "A distributed-systems pattern (e.g., Temporal) of checkpointing each completed step and recording non-deterministic effects so a crashed run replays finished steps from storage and resumes instead of restarting from zero.", es: "Un patrón de sistemas distribuidos (por ejemplo, Temporal) que registra un checkpoint de cada paso completado y guarda los efectos no deterministas, de modo que una ejecución que se cae reproduce desde almacenamiento los pasos ya terminados y se reanuda en lugar de reiniciar desde cero." },
	},
	{
		term: "Durable execution state",
		slug: "durable-execution-state",
		def: { en: "The journaled progress of a multi-step agent turn (tool calls, human-in-the-loop) that survives a crash via replay, treating completed LLM calls as idempotent activities not re-executed — distinct from durable memory.", es: "El progreso registrado en un journal de un turno de agente de varios pasos (llamadas a herramientas, human-in-the-loop) que sobrevive a una caída mediante replay, tratando las llamadas al LLM ya completadas como actividades idempotentes que no se vuelven a ejecutar; es distinto de la memoria duradera." },
	},
	{
		term: "Effort budget",
		slug: "effort-budget",
		def: { en: "An explicit per-subtask limit (number of sub-agents and tool calls) the orchestrator assigns to workers to prevent duplicated work and over-research.", es: "Un límite explícito por subtarea (número de sub-agents y de llamadas a herramientas) que el orchestrator asigna a los workers para evitar trabajo duplicado y sobre-investigación." },
	},
	{
		term: "Effort parameter",
		slug: "effort-parameter",
		def: { en: "The Claude API control (low through max) that sets how hard a reasoning model works on a turn — the successor to the deprecated budget_tokens knob.", es: "El control de la API de Claude (de low a max) que define cuánto se esfuerza un modelo de razonamiento en un turno: el sucesor del obsoleto ajuste budget_tokens." },
	},
	{
		term: "Elicitation",
		slug: "elicitation",
		def: { en: "An MCP capability (added in the 2025-06-18 spec) letting a server pause mid-operation to ask the user for additional structured input.", es: "Una capacidad de MCP (añadida en la especificación 2025-06-18) que permite a un servidor pausar a mitad de una operación para pedirle al usuario entrada estructurada adicional." },
	},
	{
		term: "Embedding",
		slug: "embedding",
		def: { en: "A numeric vector representation of text that places semantically similar text close together, enabling similarity search but losing precision on rare tokens, exact identifiers, and proper nouns.", es: "Una representación numérica vectorial del texto que sitúa cerca al texto semánticamente similar, habilitando la búsqueda por similitud pero perdiendo precisión en tokens raros, identificadores exactos y nombres propios." },
	},
	{
		term: "Entropy collapse",
		slug: "entropy-collapse",
		def: { en: "A GRPO failure mode where the policy becomes nearly deterministic — probability mass concentrates on single tokens — and the model stops exploring alternatives during training.", es: "Un modo de fallo de GRPO en el que la política se vuelve casi determinista —la masa de probabilidad se concentra en tokens individuales— y el modelo deja de explorar alternativas durante el entrenamiento." },
	},
	{
		term: "Error analysis (open / axial coding)",
		slug: "error-analysis-open-axial-coding",
		def: { en: "An ethnographic method of reading real traces, writing free-form notes on each failure (open coding), then grouping them into themes (axial coding) to derive graders from the real failure distribution.", es: "Un método etnográfico que consiste en leer trazas reales, escribir notas libres sobre cada fallo (open coding) y luego agruparlas en temas (axial coding) para derivar evaluadores a partir de la distribución real de fallos." },
	},
	{
		term: "Evaluator-optimizer",
		slug: "evaluator-optimizer",
		def: { en: "A workflow where one LLM generates output and a second scores it against criteria and returns feedback in a loop until a quality threshold is met — capped with an iteration limit to avoid infinite loops.", es: "Un flujo de trabajo en el que un LLM genera la salida y un segundo la puntúa contra unos criterios y devuelve retroalimentación en bucle hasta alcanzar un umbral de calidad, acotado con un límite de iteraciones para evitar bucles infinitos." },
	},
	{
		term: "Failure attribution",
		slug: "failure-attribution",
		def: { en: "Identifying which agent and which decisive step caused a failure in a multi-agent system; research shows full input+context traces make this materially more accurate than output-only logs.", es: "Identificar qué agente y qué paso decisivo causaron un fallo en un sistema multiagente; la investigación muestra que las trazas completas de entrada y contexto lo hacen sustancialmente más preciso que los registros solo de salida." },
	},
	{
		term: "GraphRAG",
		slug: "graphrag",
		def: { en: "A retrieval method that builds an entity-relationship knowledge graph and hierarchical community summaries (via Leiden community detection) to answer global, whole-corpus questions flat vector RAG cannot.", es: "Un método de recuperación que construye un grafo de conocimiento de entidades y relaciones junto con resúmenes jerárquicos de comunidades (mediante detección de comunidades Leiden) para responder preguntas globales sobre todo el corpus que el RAG vectorial plano no puede abordar." },
	},
	{
		term: "Ground truth",
		slug: "ground-truth",
		def: { en: "An observable external fact injected into the loop — a real tool result, a passing/failing test, a concrete error — as opposed to the model's own unverified self-assessment.", es: "Un hecho externo observable inyectado en el loop (un resultado real de una herramienta, una prueba que pasa o falla, un error concreto), en contraposición a la autoevaluación no verificada del propio modelo." },
	},
	{
		term: "GRPO (Group Relative Policy Optimization)",
		slug: "grpo-group-relative-policy-optimization",
		def: { en: "An RL algorithm (DeepSeekMath, 2024) that drops the value/critic network by sampling a group of responses per prompt and using the group's mean reward as the baseline for each response's advantage.", es: "Un algoritmo de RL (DeepSeekMath, 2024) que prescinde de la red de valor/crítico muestreando un grupo de respuestas por prompt y usando la recompensa media del grupo como línea base para la ventaja de cada respuesta." },
	},
	{
		term: "Harness",
		slug: "harness",
		def: { en: "All the code, configuration, and execution logic wrapping the model — the loop, tool execution, state persistence, stopping conditions, and observability — i.e., everything in an agent that isn't the model itself.", es: "Todo el código, la configuración y la lógica de ejecución que envuelven al modelo —el bucle, la ejecución de herramientas, la persistencia de estado, las condiciones de parada y la observabilidad—; es decir, todo lo que hay en un agente que no es el modelo en sí." },
	},
	{
		term: "HMAC / pepper",
		slug: "hmac-pepper",
		def: { en: "A keyed hash using a secret 'pepper' to deterministically obfuscate identifiers in traces — the same ID always maps to the same value so you can correlate, without leaving the real ID brute-forceable like a plain hash would.", es: "Un hash con clave que usa un 'pepper' secreto para ofuscar de forma determinista los identificadores en las trazas: el mismo ID siempre se mapea al mismo valor, de modo que puedes correlacionar sin dejar el ID real vulnerable a fuerza bruta como ocurriría con un hash simple." },
	},
	{
		term: "Human-in-the-loop (HITL)",
		slug: "human-in-the-loop-hitl",
		def: { en: "A deterministic control step that pauses the agent for human approval, correction, or escalation to reset accumulated error and gate high-stakes or irreversible actions — not a prompt asking the model to check in when unsure.", es: "Un paso de control determinista que pausa al agente para que un humano apruebe, corrija o escale, reseteando el error acumulado y filtrando acciones de alto riesgo o irreversibles; no es un prompt que le pide al modelo que consulte cuando dude." },
	},
	{
		term: "Hybrid search / RRF",
		slug: "hybrid-search-rrf",
		def: { en: "Combining dense (embedding) and sparse (BM25/lexical) retrieval and fusing their rankings, commonly via Reciprocal Rank Fusion (RRF), to get both semantic and exact-match strengths.", es: "Combinar la recuperación densa (embeddings) y la dispersa (BM25/léxica) y fusionar sus rankings, habitualmente mediante Reciprocal Rank Fusion (RRF), para obtener tanto la fortaleza semántica como la de coincidencia exacta." },
	},
	{
		term: "Idempotency",
		slug: "idempotency",
		def: { en: "A property where running an operation twice has the same effect as once — typically enforced by a deterministic key (e.g., from workflow_id + step_id, or a pending-action id) so retries after a crash, network failure, or queue redelivery are deduplicated rather than double-applied.", es: "Una propiedad por la cual ejecutar una operación dos veces tiene el mismo efecto que ejecutarla una sola vez, normalmente garantizada mediante una clave determinista (por ejemplo, derivada de workflow_id + step_id, o un id de acción pendiente) para que los reintentos tras un fallo, una caída de red o una reentrega de cola se deduppliquen en lugar de aplicarse dos veces." },
	},
	{
		term: "Implicit decisions",
		slug: "implicit-decisions",
		def: { en: "The unstated assumptions (style, format, interpretation) an agent bakes into its output; when two agents make incompatible implicit decisions on the same artifact, the results can't be reconciled afterward.", es: "Los supuestos no declarados (estilo, formato, interpretación) que un agente incorpora en su salida; cuando dos agentes toman decisiones implícitas incompatibles sobre el mismo artefacto, los resultados no pueden reconciliarse después." },
	},
	{
		term: "Index lag / staleness",
		slug: "index-lag-staleness",
		def: { en: "The gap between when source data changes and when a precomputed vector index is rebuilt, during which the index returns outdated results — a problem agentic search avoids by reading current bytes.", es: "El desfase entre el momento en que cambian los datos de origen y el momento en que se reconstruye un índice vectorial precomputado, durante el cual el índice devuelve resultados desactualizados, un problema que la búsqueda agéntica evita al leer los bytes actuales." },
	},
	{
		term: "Indirect prompt injection",
		slug: "indirect-prompt-injection",
		def: { en: "Prompt injection delivered not by the user but through content the agent reads while working (a fetched web page, a RAG document, a tool result), so the attacker never talks to the agent directly.", es: "Prompt injection entregado no por el usuario sino a través de contenido que el agente lee mientras trabaja (una página web obtenida, un documento de RAG, el resultado de una herramienta), de modo que el atacante nunca habla directamente con el agente." },
	},
	{
		term: "Induction head",
		slug: "induction-head",
		def: { en: "A two-attention-head circuit that detects a prior 'A→B' pattern and predicts B after seeing A again — the mechanistic engine of in-context (few-shot) learning.", es: "Un circuito de dos attention heads que detecta un patrón previo 'A→B' y predice B al volver a ver A: el motor mecanístico del aprendizaje in-context (few-shot)." },
	},
	{
		term: "Injection Success Rate (ISR) vs Attack Success Rate (ASR)",
		slug: "injection-success-rate-isr-vs-attack-success-rate-asr",
		def: { en: "In memory-attack papers, ISR measures whether a malicious record lands in memory while ASR measures whether a later victim query actually produces the malicious action — ISR is typically much higher than ASR.", es: "En los artículos sobre ataques a la memoria, el ISR mide si un registro malicioso logra alojarse en la memoria, mientras que el ASR mide si una consulta posterior de la víctima realmente produce la acción maliciosa; el ISR suele ser mucho más alto que el ASR." },
	},
	{
		term: "Intrinsic self-correction",
		slug: "intrinsic-self-correction",
		def: { en: "A model trying to fix its own answer using only its internal judgment with no external feedback; research shows this often fails to help and can degrade reasoning.", es: "Un modelo que intenta corregir su propia respuesta usando solo su juicio interno, sin retroalimentación externa; la investigación muestra que esto a menudo no ayuda e incluso puede degradar el razonamiento." },
	},
	{
		term: "Just-in-time retrieval",
		slug: "just-in-time-retrieval",
		def: { en: "Letting the agent hold lightweight identifiers (file paths, queries, links) and load data on demand with tools as it discovers relevance, instead of pre-loading a large retrieved blob.", es: "Dejar que el agente mantenga identificadores ligeros (rutas de archivo, consultas, enlaces) y cargue los datos bajo demanda con herramientas a medida que descubre su relevancia, en lugar de precargar un gran bloque recuperado." },
	},
	{
		term: "KV cache",
		slug: "kv-cache",
		def: { en: "Stored key/value projections for already-processed tokens so they aren't recomputed at each decode step; its memory grows linearly with context length, unlike the quadratic attention compute.", es: "Proyecciones de key/value almacenadas para los tokens ya procesados, de modo que no se recalculan en cada paso de decodificación; su memoria crece linealmente con la longitud del contexto, a diferencia del cómputo cuadrático de la atención." },
	},
	{
		term: "Late interaction (ColBERTv2)",
		slug: "late-interaction-colbertv2",
		def: { en: "A multi-vector approach that keeps a separate embedding per token and scores relevance with per-token MaxSim, sitting between single-vector dense retrieval and lexical search in precision and cost.", es: "Un enfoque multivector que mantiene un embedding separado por token y puntúa la relevancia con MaxSim por token, situándose entre la recuperación densa de un solo vector y la búsqueda léxica en precisión y coste." },
	},
	{
		term: "Lethal trifecta",
		slug: "lethal-trifecta",
		def: { en: "Simon Willison's model: an agent becomes a guaranteed exfiltration tool when it simultaneously has access to private data, exposure to untrusted content, and a channel to send data externally — removing any one breaks the chain.", es: "El modelo de Simon Willison: un agente se convierte en una herramienta de exfiltración garantizada cuando simultáneamente tiene acceso a datos privados, exposición a contenido no confiable y un canal para enviar datos al exterior; eliminar cualquiera de los tres rompe la cadena." },
	},
	{
		term: "LLM-as-judge",
		slug: "llm-as-judge",
		def: { en: "Using a language model to score or compare outputs against a rubric — useful for subjective qualities but subject to systematic biases like position, verbosity, and self-preference.", es: "Usar un modelo de lenguaje para puntuar o comparar salidas frente a una rúbrica; útil para cualidades subjetivas pero sujeto a sesgos sistemáticos como la posición, la verbosidad y la auto-preferencia." },
	},
	{
		term: "Lost in the middle",
		slug: "lost-in-the-middle",
		def: { en: "The empirical U-shaped pattern where models recall information at the start and end of a long context well but systematically under-attend to the middle.", es: "El patrón empírico en forma de U según el cual los modelos recuerdan bien la información al inicio y al final de un contexto largo, pero atienden sistemáticamente menos a la parte central." },
	},
	{
		term: "MAST (Multi-Agent System failure Taxonomy)",
		slug: "mast-multi-agent-system-failure-taxonomy",
		def: { en: "A UC Berkeley taxonomy of 14 multi-agent failure modes grouped into specification/system-design (~42%), inter-agent misalignment (~37%), and task-verification (~21%) categories.", es: "Una taxonomía de UC Berkeley de 14 modos de fallo de sistemas multiagente agrupados en categorías de especificación/diseño del sistema (~42%), desalineación entre agentes (~37%) y verificación de tareas (~21%)." },
	},
	{
		term: "MDP (Markov Decision Process)",
		slug: "mdp-markov-decision-process",
		def: { en: "A decision model where the agent sees the full state of the world before each action. It's the fully-observed special case of a POMDP; a single, self-contained LLM API call is a degenerate one-step MDP, while a real agent acting on partial information is a POMDP.", es: "Un modelo de decisión en el que el agente ve el estado completo del mundo antes de cada acción. Es el caso especial totalmente observado de un POMDP; una llamada de API a un LLM aislada y autocontenida es un MDP degenerado de un solo paso, mientras que un agente real que actúa sobre información parcial es un POMDP." },
	},
	{
		term: "Memory poisoning",
		slug: "memory-poisoning",
		def: { en: "An attack that plants malicious content into an agent's durable memory so it persists across sessions — strictly worse than a single-turn prompt injection because it survives the turn that planted it.", es: "Un ataque que planta contenido malicioso en la memoria duradera de un agente para que persista entre sesiones, estrictamente peor que una prompt injection de un solo turno porque sobrevive al turno que lo plantó." },
	},
	{
		term: "Model Context Protocol (MCP)",
		slug: "model-context-protocol-mcp",
		def: { en: "An open standard from Anthropic (Nov 2024) that connects agents to external tools and data sources through one uniform interface; because tool descriptions and results flow unsanitized into context, a malicious or swapped server can inject instructions.", es: "Un estándar abierto de Anthropic (noviembre de 2024) que conecta agentes con herramientas y fuentes de datos externas mediante una única interfaz uniforme; como las descripciones y los resultados de las herramientas fluyen sin sanear hacia el contexto, un servidor malicioso o suplantado puede inyectar instrucciones." },
	},
	{
		term: "Needle-in-a-haystack (NIAH)",
		slug: "needle-in-a-haystack-niah",
		def: { en: "A long-context test that hides a specific string in a large body of filler; because exact-string retrieval is easy it scores near 100%, masking the real degradation on semantic, multi-step tasks.", es: "Una prueba de contexto largo que esconde una cadena concreta dentro de un gran cuerpo de relleno; como la recuperación de cadenas exactas es fácil, puntúa cerca del 100% y enmascara la degradación real en tareas semánticas y de varios pasos." },
	},
	{
		term: "Next-token prediction",
		slug: "next-token-prediction",
		def: { en: "The core operation of an LLM: given the tokens so far, output a probability distribution over the next token, sample one, append it, and repeat.", es: "La operación central de un LLM: dados los tokens vistos hasta el momento, produce una distribución de probabilidad sobre el siguiente token, muestrea uno, lo añade y repite." },
	},
	{
		term: "Online evals",
		slug: "online-evals",
		def: { en: "Quality checks on live sampled production traffic — cheap heuristics on all traffic plus an LLM-as-judge on a fraction — that catch distribution drift offline test sets miss and feed new failures back into the offline dataset.", es: "Controles de calidad sobre tráfico de producción muestreado en vivo —heurísticas baratas sobre todo el tráfico más un LLM-as-judge sobre una fracción— que detectan la deriva de distribución que los conjuntos de prueba offline pasan por alto y realimentan los nuevos fallos al conjunto de datos offline." },
	},
	{
		term: "Orchestration determinism",
		slug: "orchestration-determinism",
		def: { en: "Keeping coordination logic deterministic and resumable (the Temporal model) while confining non-deterministic LLM/tool calls to discrete activities, so a crashed run can resume instead of restarting.", es: "Mantener la lógica de coordinación determinista y reanudable (el modelo de Temporal) mientras se confinan las llamadas no deterministas a LLM/herramientas en actividades discretas, de modo que una ejecución caída pueda reanudarse en lugar de reiniciarse." },
	},
	{
		term: "Orchestrator-worker",
		slug: "orchestrator-worker",
		def: { en: "A multi-agent pattern where a lead agent decomposes a task, spawns specialized workers with bounded mandates, and synthesizes their results into one answer.", es: "Un patrón multiagente en el que un agente líder descompone una tarea, lanza workers especializados con mandatos acotados y sintetiza sus resultados en una única respuesta." },
	},
	{
		term: "OTel GenAI semantic conventions",
		slug: "otel-genai-semantic-conventions",
		def: { en: "OpenTelemetry's standardized attribute schema for LLM/agent telemetry (the gen_ai.* namespace) that lets you switch observability backends without re-instrumenting — still experimental as of 2026.", es: "El esquema de atributos estandarizado de OpenTelemetry para telemetría de LLM/agentes (el espacio de nombres gen_ai.*) que permite cambiar de backend de observabilidad sin reinstrumentar, todavía experimental a fecha de 2026." },
	},
	{
		term: "pass@k vs pass^k",
		slug: "pass-k-vs-pass-k",
		def: { en: "pass@k is the probability that at least one of k attempts succeeds (a capability/best-case measure); pass^k is the probability that all k independent attempts succeed (reliability, ≈p^k), and production cares about pass^k.", es: "pass@k es la probabilidad de que al menos uno de k intentos tenga éxito (una medida de capacidad o de mejor caso); pass^k es la probabilidad de que los k intentos independientes tengan éxito todos (fiabilidad, ≈p^k), y en producción lo que importa es pass^k." },
	},
	{
		term: "Permission chain",
		slug: "permission-chain",
		def: { en: "The fixed evaluation order the Claude Agent SDK applies to each tool call — hooks/deny rules, then ask rules, then permission mode, then allow rules, then the canUseTool callback — determining what runs, waits, or is blocked.", es: "El orden de evaluación fijo que el Claude Agent SDK aplica a cada llamada a herramienta —hooks/reglas de denegación, luego reglas de pregunta, luego el modo de permisos, luego reglas de permitido, y finalmente el callback canUseTool— que determina qué se ejecuta, espera o se bloquea." },
	},
	{
		term: "Plan-then-execute",
		slug: "plan-then-execute",
		def: { en: "An agent pattern that produces an explicit, reviewable plan before taking any action, enabling human interception of write operations and better control of dependencies.", es: "Un patrón de agente que produce un plan explícito y revisable antes de tomar cualquier acción, lo que permite la intercepción humana de las operaciones de escritura y un mejor control de las dependencias." },
	},
	{
		term: "Poka-yoke",
		slug: "poka-yoke",
		def: { en: "A design principle borrowed from manufacturing: making tools and formats error-proof so the agent structurally cannot make certain mistakes.", es: "Un principio de diseño tomado de la manufactura: hacer las herramientas y los formatos a prueba de errores para que el agente estructuralmente no pueda cometer ciertos fallos." },
	},
	{
		term: "Policy (π)",
		slug: "policy",
		def: { en: "The function mapping what the agent has observed so far to its next action; in an LLM agent, the reasoner conditioned by its system prompt IS the policy π(action | observation, history).", es: "La función que mapea lo que el agente ha observado hasta el momento a su siguiente acción; en un agente LLM, el razonador condicionado por su system prompt ES la política π(acción | observación, historial)." },
	},
	{
		term: "POMDP (Partially Observable Markov Decision Process)",
		slug: "pomdp-partially-observable-markov-decision-process",
		def: { en: "A decision-making model where an agent never sees the true world state directly and must act on a belief inferred from partial observations — the formal lens for LLM agents.", es: "Un modelo de toma de decisiones en el que un agente nunca observa directamente el estado real del mundo y debe actuar según una creencia inferida a partir de observaciones parciales: la lente formal para los agentes LLM." },
	},
	{
		term: "Position / verbosity / self-preference bias",
		slug: "position-verbosity-self-preference-bias",
		def: { en: "Systematic LLM-judge errors: favoring an answer by its presentation order, rewarding longer answers regardless of quality, and preferring outputs from its own model family.", es: "Errores sistemáticos del LLM-as-judge: favorecer una respuesta por su orden de presentación, premiar las respuestas más largas sin importar su calidad y preferir las salidas de su propia familia de modelos." },
	},
	{
		term: "Progressive disclosure",
		slug: "progressive-disclosure",
		def: { en: "Loading only a tool's name and short description up front and revealing fuller instructions and materials only when the tool becomes relevant, to save context tokens.", es: "Cargar de entrada solo el nombre y una breve descripción de una herramienta y revelar las instrucciones y materiales más completos únicamente cuando la herramienta se vuelve relevante, para ahorrar tokens de contexto." },
	},
	{
		term: "Prompt caching",
		slug: "prompt-caching",
		def: { en: "Reusing the model's cached computation for a stable, byte-for-byte-identical prompt prefix so repeated requests are far cheaper (cached reads cost roughly 10% of normal input price); any change to the prefix invalidates the cache.", es: "Reutilizar el cómputo cacheado del modelo para un prefijo de prompt estable e idéntico byte a byte, de modo que las peticiones repetidas son mucho más baratas (las lecturas cacheadas cuestan alrededor del 10% del precio normal de entrada); cualquier cambio en el prefijo invalida la caché." },
	},
	{
		term: "Prompt injection",
		slug: "prompt-injection",
		def: { en: "An attack where instructions hidden in untrusted content (a document, email, web page) are processed by an LLM as legitimate commands, hijacking the agent's behavior.", es: "Un ataque en el que instrucciones ocultas en contenido no confiable (un documento, un correo, una página web) son procesadas por un LLM como comandos legítimos, secuestrando el comportamiento del agente." },
	},
	{
		term: "Provenance / source-aware memory",
		slug: "provenance-source-aware-memory",
		def: { en: "Tagging each memory entry with its origin and a trust level so retrieval can quarantine or down-weight entries from untrusted sources.", es: "Etiquetar cada entrada de memoria con su origen y un nivel de confianza para que la recuperación pueda poner en cuarentena o reducir el peso de las entradas provenientes de fuentes no confiables." },
	},
	{
		term: "RAG (Retrieval-Augmented Generation)",
		slug: "rag-retrieval-augmented-generation",
		def: { en: "Chunking and embedding documents into an index, then retrieving the top-k most relevant chunks into the prompt before the model answers — a single retrieval pass against the original query.", es: "Dividir documentos en fragmentos (chunking) y generar sus embeddings en un índice, para luego recuperar los k fragmentos más relevantes hacia el prompt antes de que el modelo responda — una única pasada de recuperación contra la consulta original." },
	},
	{
		term: "ReAct (think-act-observe)",
		slug: "react-think-act-observe",
		def: { en: "An agent loop interleaving reasoning traces ('think') with environment-affecting actions ('act') and their feedback ('observe'); its append-only transcript adapts to dynamic tasks but causes context growth and error compounding on long horizons.", es: "Un bucle de agente que intercala trazas de razonamiento ('think') con acciones que afectan al entorno ('act') y su realimentación ('observe'); su transcripción de solo-anexado se adapta a tareas dinámicas, pero provoca crecimiento del contexto y acumulación de error en horizontes largos." },
	},
	{
		term: "Read/write asymmetry",
		slug: "read-write-asymmetry",
		def: { en: "The principle that read-only work can be safely parallelized across agents (no shared mutable state), while write/generation work must be serialized on one thread to avoid conflicting decisions.", es: "El principio de que el trabajo de solo lectura puede paralelizarse con seguridad entre agentes (sin estado mutable compartido), mientras que el trabajo de escritura o generación debe serializarse en un solo hilo para evitar decisiones en conflicto." },
	},
	{
		term: "Reflexion",
		slug: "reflexion",
		def: { en: "A technique where an agent verbally reflects on its own past failures to improve; fragile without an external truth signal because models tend to rationalize rather than correct.", es: "Una técnica en la que un agente reflexiona verbalmente sobre sus propios fallos pasados para mejorar; frágil sin una señal externa de verdad, porque los modelos tienden a racionalizar en lugar de corregir." },
	},
	{
		term: "Reliability composition (geometric decay)",
		slug: "reliability-composition-geometric-decay",
		def: { en: "The fact that if each step succeeds with probability p, an n-step chain succeeds at p^n, so even near-perfect per-step agents become unreliable over long horizons.", es: "El hecho de que si cada paso tiene éxito con probabilidad p, una cadena de n pasos tiene éxito con p^n, de modo que incluso agentes casi perfectos por paso se vuelven poco fiables en horizontes largos." },
	},
	{
		term: "Replay over recorded tool-responses",
		slug: "replay-over-recorded-tool-responses",
		def: { en: "Re-running an agent against captured production messages and recorded tool results (used as fixtures) instead of calling tools live, turning a non-reproducible failure into a deterministic, token-free test.", es: "Volver a ejecutar un agente contra mensajes de producción capturados y resultados de herramientas grabados (usados como fixtures) en lugar de invocar las herramientas en vivo, convirtiendo un fallo no reproducible en una prueba determinista y sin consumo de tokens." },
	},
	{
		term: "Reranking / cross-encoder",
		slug: "reranking-cross-encoder",
		def: { en: "A second retrieval stage that reorders a large set of cheap candidate chunks with a model that reads query and document together, producing more accurate top-k at the cost of added latency.", es: "Una segunda etapa de recuperación que reordena un conjunto amplio de fragmentos candidatos baratos con un modelo que lee la consulta y el documento juntos, produciendo un top-k más preciso a costa de mayor latencia." },
	},
	{
		term: "Reversibility gate",
		slug: "reversibility-gate",
		def: { en: "A control point that intercepts actions which are expensive or impossible to undo before they execute, while letting reversible reads run automatically.", es: "Un punto de control que intercepta, antes de que se ejecuten, las acciones caras o imposibles de deshacer, mientras deja que las lecturas reversibles corran automáticamente." },
	},
	{
		term: "Reward hacking / Goodhart's Law",
		slug: "reward-hacking-goodhart-s-law",
		def: { en: "When an optimizer or agent satisfies a weak verifier without truly solving the task (e.g., overwriting a test to make a suite pass), which is why graders must check the real effect on the world.", es: "Cuando un optimizador o agente satisface un verificador débil sin resolver realmente la tarea (p. ej., sobrescribir una prueba para que pase una suite), razón por la cual los evaluadores deben comprobar el efecto real sobre el mundo." },
	},
	{
		term: "RLHF (RL from Human Feedback)",
		slug: "rlhf-rl-from-human-feedback",
		def: { en: "Aligning a model by training a reward model on human preference comparisons, then optimizing the policy against it with RL so outputs match what human annotators prefer.", es: "Alinear un modelo entrenando un reward model sobre comparaciones de preferencia humana y optimizando luego la política contra él mediante RL, de modo que las salidas coincidan con lo que prefieren los anotadores humanos." },
	},
	{
		term: "RLVR (RL from Verifiable Rewards)",
		slug: "rlvr-rl-from-verifiable-rewards",
		def: { en: "RL where the reward is a programmatic, checkable function — did the test pass, is the math correct, was the goal state reached — making it much harder to game than a learned reward model and shaping reasoning and tool-use.", es: "RL en el que la recompensa es una función programática y comprobable — si pasó el test, si la matemática es correcta, si se alcanzó el estado objetivo — lo que la hace mucho más difícil de manipular que un reward model aprendido y moldea el razonamiento y el uso de herramientas." },
	},
	{
		term: "Row-level security (RLS)",
		slug: "row-level-security-rls",
		def: { en: "A database feature (e.g., Postgres) that filters rows by a per-session policy such as tenant/org id, enforcing tenant isolation in the data layer even if application code forgets a WHERE clause.", es: "Una característica de las bases de datos (por ejemplo, Postgres) que filtra filas según una política por sesión, como el id de tenant/organización, imponiendo el aislamiento entre tenants en la capa de datos incluso si el código de la aplicación olvida una cláusula WHERE." },
	},
	{
		term: "Rug pull",
		slug: "rug-pull",
		def: { en: "An attack where a previously approved tool or MCP server silently changes its definition or behavior afterward (e.g., CVE-2025-54136 'MCPoison' against Cursor, patched July 2025).", es: "Un ataque en el que una herramienta o un servidor MCP previamente aprobado cambia silenciosamente su definición o comportamiento después (por ejemplo, CVE-2025-54136 'MCPoison' contra Cursor, parcheado en julio de 2025)." },
	},
	{
		term: "Self-consistency",
		slug: "self-consistency",
		def: { en: "Sampling several independent reasoning traces for one prompt and taking the majority-vote answer; gains typically plateau around 10–15 samples and it often rivals multi-agent debate at equal compute.", es: "Muestrear varias trazas de razonamiento independientes para un mismo prompt y tomar la respuesta por mayoría; las ganancias suelen estabilizarse alrededor de 10 a 15 muestras y a menudo rivaliza con el debate multiagente a igual cómputo." },
	},
	{
		term: "SFT (Supervised Fine-Tuning)",
		slug: "sft-supervised-fine-tuning",
		def: { en: "Training a base model on curated input-output examples (often distilled from a larger teacher) to teach response format, tone, and chain-of-thought structure — it grabs form, not new factual knowledge.", es: "Entrenar un modelo base con ejemplos curados de entrada-salida (a menudo destilados de un teacher más grande) para enseñarle formato de respuesta, tono y estructura de chain-of-thought — captura la forma, no conocimiento factual nuevo." },
	},
	{
		term: "Span vs metric cardinality",
		slug: "span-vs-metric-cardinality",
		def: { en: "Spans want high-cardinality fields (unique IDs, content) to make individual traces findable, while metrics need bounded low-cardinality labels because each label-value combination creates a separate time series — mixing them is the core architectural mistake.", es: "Los spans requieren campos de alta cardinalidad (IDs únicos, contenido) para hacer localizables las trazas individuales, mientras que las métricas necesitan etiquetas acotadas de baja cardinalidad porque cada combinación etiqueta-valor crea una serie temporal separada — mezclarlos es el error arquitectónico central." },
	},
	{
		term: "Spotlighting",
		slug: "spotlighting",
		def: { en: "Microsoft's prompt-level technique of marking untrusted text via delimiting, datamarking, or encoding so the model is likelier to treat it as data — a probabilistic mitigation, not a hard security boundary.", es: "La técnica a nivel de prompt de Microsoft de marcar el texto no confiable mediante delimitación, datamarking o codificación para que el modelo sea más propenso a tratarlo como datos; una mitigación probabilística, no un límite de seguridad rígido." },
	},
	{
		term: "Stateless",
		slug: "stateless",
		def: { en: "The model retains nothing between API calls; a 'conversation' only exists because you resend the prior history on every request.", es: "El modelo no retiene nada entre llamadas a la API; una 'conversación' solo existe porque reenvías el historial previo en cada petición." },
	},
	{
		term: "Stateless reducer",
		slug: "stateless-reducer",
		def: { en: "Treating the model as a near-pure function from current state plus a new observation to the next action, holding no durable memory of its own so all persistent state lives outside it.", es: "Tratar al modelo como una función casi pura que va del estado actual más una nueva observación a la siguiente acción, sin mantener memoria duradera propia, de modo que todo el estado persistente vive fuera de él." },
	},
	{
		term: "Stochastic",
		slug: "stochastic",
		def: { en: "The output isn't fixed: run the model twice on the same input and you can get different answers, because each next token is sampled at random from a probability distribution. This is why one passing run proves little and you measure reliability across many (pass^k), not one.", es: "La salida no es fija: ejecuta el modelo dos veces con la misma entrada y puedes obtener respuestas distintas, porque cada token siguiente se muestrea al azar de una distribución de probabilidad. Por eso una sola ejecución correcta prueba poco y la fiabilidad se mide en muchas (pass^k), no en una." },
	},
	{
		term: "Sub-agent",
		slug: "sub-agent",
		def: { en: "A separate LLM invocation with its own isolated context window, spawned to handle a slice of work and return only a distilled result to the main thread — a context-management device, not an org-chart role.", es: "Una invocación de LLM independiente con su propia context window aislada, lanzada para encargarse de una porción del trabajo y devolver solo un resultado destilado al hilo principal — un mecanismo de gestión de contexto, no un rol de organigrama." },
	},
	{
		term: "Sycophancy",
		slug: "sycophancy",
		def: { en: "A trained bias where models flatter, over-assert, and avoid contradicting the user, arising because RLHF optimizes for what human annotators prefer rather than what is correct.", es: "Un sesgo entrenado en el que los modelos adulan, sobreafirman y evitan contradecir al usuario, surgido porque RLHF optimiza por lo que prefieren los anotadores humanos en lugar de por lo que es correcto." },
	},
	{
		term: "Taint tracking / information-flow control (IFC)",
		slug: "taint-tracking-information-flow-control-ifc",
		def: { en: "Marking each value with its provenance (trusted vs untrusted) and propagating that mark through deterministic code, so a consequential action derived from untrusted data is automatically blocked.", es: "Marcar cada valor con su procedencia (confiable o no confiable) y propagar esa marca a través del código determinista, de modo que una acción de consecuencia derivada de datos no confiables se bloquee automáticamente." },
	},
	{
		term: "Task time-horizon",
		slug: "task-time-horizon",
		def: { en: "METR's metric for agent capability: the human-time length of task an agent can complete at roughly 50% reliability — a better proxy for agentic ability than single-turn benchmarks.", es: "La métrica de capacidad de agentes de METR: la duración en tiempo humano de la tarea que un agente puede completar con aproximadamente un 50% de fiabilidad — un proxy mejor de la capacidad agéntica que los benchmarks de un solo turno." },
	},
	{
		term: "Temperature / top-p (sampling)",
		slug: "temperature-top-p-sampling",
		def: { en: "Parameters that control how spread-out the model's sampling is — higher values make output more varied — though the newest reasoning models replace them with an effort control.", es: "Parámetros que controlan cuán dispersa es la muestreo del modelo —valores más altos producen una salida más variada—, aunque los modelos de razonamiento más recientes los reemplazan por un control de esfuerzo." },
	},
	{
		term: "Termination tool",
		slug: "termination-tool",
		def: { en: "An explicit action the model can call to declare it is finished or to escalate to a human, giving the loop a clean, intentional way to stop instead of trailing off.", es: "Una acción explícita que el modelo puede invocar para declarar que ha terminado o para escalar a un humano, dando al loop una forma limpia e intencional de detenerse en lugar de irse apagando." },
	},
	{
		term: "Test-time compute / extended thinking",
		slug: "test-time-compute-extended-thinking",
		def: { en: "Spending extra inference-time reasoning tokens to improve answer quality, controlled on current Claude models by the effort parameter rather than a fixed token budget.", es: "Gastar tokens de razonamiento adicionales en tiempo de inferencia para mejorar la calidad de la respuesta, controlado en los modelos Claude actuales mediante el parámetro de esfuerzo en lugar de un presupuesto fijo de tokens." },
	},
	{
		term: "TOCTOU (time-of-check to time-of-use)",
		slug: "toctou-time-of-check-to-time-of-use",
		def: { en: "A class of bug where what was checked and what gets used drift apart between the two moments. In an agent: a human approves one action, but the model is re-invoked and runs a slightly different one. The fix is to persist the validated input at check time and execute that exact record, not a fresh model call.", es: "Una clase de bug en la que lo que se verificó y lo que se ejecuta se separan entre los dos momentos. En un agente: un humano aprueba una acción, pero el modelo se reinvoca y ejecuta una ligeramente distinta. La solución es persistir la entrada validada en el momento de la verificación y ejecutar ese registro exacto, no una nueva llamada al modelo." },
	},
	{
		term: "Token / BPE (Byte-Pair Encoding)",
		slug: "token-bpe-byte-pair-encoding",
		def: { en: "The model reads and writes in subword chunks ('tokens') produced by byte-pair encoding rather than characters or whole words, which is why digit grouping breaks arithmetic and exact character counting.", es: "El modelo lee y escribe en fragmentos de subpalabras ('tokens') generados por byte-pair encoding en lugar de caracteres o palabras completas, por lo que la agrupación de dígitos rompe la aritmética y el conteo exacto de caracteres." },
	},
	{
		term: "Tool (for an LLM)",
		slug: "tool-for-an-llm",
		def: { en: "A function the model can invoke by name with structured arguments; the set of available tools defines everything the agent is able to do.", es: "Una función que el modelo puede invocar por su nombre con argumentos estructurados; el conjunto de tools disponibles define todo lo que el agente es capaz de hacer." },
	},
	{
		term: "Tool poisoning",
		slug: "tool-poisoning",
		def: { en: "An attack where malicious instructions are hidden inside a tool's description or metadata, which the model reads into its context before the tool is ever called.", es: "Un ataque en el que se ocultan instrucciones maliciosas dentro de la descripción o los metadatos de una herramienta, que el modelo lee hacia su contexto antes incluso de que la herramienta llegue a invocarse." },
	},
	{
		term: "Trajectory",
		slug: "trajectory",
		def: { en: "The actual ordered sequence of an agent's decisions, tool calls, arguments, and results over a turn — the thing you reconstruct to debug, as opposed to the model's narrated explanation.", es: "La secuencia ordenada y real de decisiones, llamadas a herramientas, argumentos y resultados de un agente a lo largo de un turno — aquello que reconstruyes para depurar, en contraste con la explicación narrada por el modelo." },
	},
	{
		term: "Trajectory evaluation",
		slug: "trajectory-evaluation",
		def: { en: "Grading how an agent reached an answer — the sequence of tool calls, parameters, and confirmations — rather than only whether the final outcome was correct.", es: "Evaluar cómo un agente llegó a una respuesta — la secuencia de llamadas a herramientas, parámetros y confirmaciones — en lugar de solo si el resultado final fue correcto." },
	},
	{
		term: "Transactional outbox",
		slug: "transactional-outbox",
		def: { en: "A pattern solving the dual-write problem by writing an 'enqueue this job' event into an outbox table inside the same DB transaction as the state change, then having a separate relay publish it — making persist-and-enqueue atomic.", es: "Un patrón que resuelve el problema de la doble escritura escribiendo un evento de tipo 'encolar este trabajo' en una tabla de outbox dentro de la misma transacción de la base de datos que el cambio de estado, y luego haciendo que un relay separado lo publique, volviendo atómico el persistir-y-encolar." },
	},
	{
		term: "Transition dynamics (T)",
		slug: "transition-dynamics-t",
		def: { en: "The rules by which an action changes the world and produces the next observation — the harness (workers, database, locks, persistence) that executes and persists effects.", es: "Las reglas por las que una acción cambia el mundo y produce la siguiente observación: el harness (workers, base de datos, locks, persistencia) que ejecuta y persiste los efectos." },
	},
	{
		term: "Tree-of-Thoughts (ToT)",
		slug: "tree-of-thoughts-tot",
		def: { en: "A reasoning method that explores multiple branching paths with self-evaluation and backtracking; strong on puzzles like Game of 24 but rarely cost-justified in production agents.", es: "Un método de razonamiento que explora múltiples ramas con autoevaluación y retroceso; potente en acertijos como el Game of 24, pero rara vez justificado por su costo en agentes de producción." },
	},
	{
		term: "Tulving's memory taxonomy",
		slug: "tulving-s-memory-taxonomy",
		def: { en: "A cognitive-science classification adapted by CoALA — working (current turn), episodic (past trajectories), semantic (facts about world/user), and procedural (skills/how-to) — each needing a different write and decay policy.", es: "Una clasificación de las ciencias cognitivas adaptada por CoALA — de trabajo (turno actual), episódica (trayectorias pasadas), semántica (hechos sobre el mundo o el usuario) y procedimental (habilidades o cómo hacer algo) — cada una con su propia política de escritura y decaimiento." },
	},
	{
		term: "Turn trace (span tree)",
		slug: "turn-trace-span-tree",
		def: { en: "A hierarchical record of one agent turn: a root span (e.g., invoke_agent) with child spans for each generation and tool call, capturing timing, tokens, args, and results.", es: "Un registro jerárquico de un turno de agente: un span raíz (por ejemplo, invoke_agent) con spans hijos por cada generación y llamada a herramienta, que captura tiempos, tokens, argumentos y resultados." },
	},
	{
		term: "Verifiable grader / fitness function",
		slug: "verifiable-grader-fitness-function",
		def: { en: "An external, objective evaluator against which self-improvement is measured; its quality is the ceiling on how much an agent can improve, since a weak grader invites Goodhart gaming.", es: "Un evaluador externo y objetivo contra el cual se mide la automejora; su calidad es el techo de cuánto puede mejorar un agente, ya que un grader débil invita a la manipulación tipo Goodhart." },
	},
	{
		term: "Workflow vs agent",
		slug: "workflow-vs-agent",
		def: { en: "A control-flow distinction: in a workflow, code predefines the trajectory and the LLM fills slots; in an agent, the LLM chooses its own actions and tools at runtime.", es: "Una distinción de flujo de control: en un workflow el código predefine la trayectoria y el LLM solo rellena huecos, mientras que en un agente el LLM elige sus propias acciones y herramientas en tiempo de ejecución." },
	},
	{
		term: "World model",
		slug: "world-model",
		def: { en: "A model that learns environment dynamics so an agent can plan and learn from simulated 'what-if' rollouts in a latent state rather than only imitating text (e.g., Genie 3, DreamerV3).", es: "Un modelo que aprende la dinámica del entorno para que un agente pueda planificar y aprender a partir de rollouts simulados de 'qué pasaría si' en un estado latente, en lugar de solo imitar texto (p. ej., Genie 3, DreamerV3)." },
	},
	{
		term: "Write-path / trust boundary",
		slug: "write-path-trust-boundary",
		def: { en: "The moment untrusted input (a document, a user message) is committed into durable memory and thereafter re-read as the agent's own trusted knowledge — the key place to enforce provenance and policy checks.", es: "El momento en que una entrada no confiable (un documento, un mensaje de usuario) se persiste en la memoria duradera y luego se relee como conocimiento propio y confiable del agente — el lugar clave para imponer comprobaciones de procedencia y de política." },
	},
	{
		term: "Write-through memory",
		slug: "write-through-memory",
		def: { en: "A long-term memory pattern where an external store (database or notes file) is the source of truth that survives context resets, with the in-window copy acting as a cache for the current turn.", es: "Un patrón de memoria a largo plazo en el que un almacén externo (una base de datos o un archivo de notas) es la fuente de verdad que sobrevive a los reinicios de contexto, mientras que la copia en ventana actúa como caché del turno actual." },
	},
];

export function glossaryHref(lang: Lang): string {
	return lang === 'es' ? '/es/learn/agentic-systems/glossary/' : '/learn/agentic-systems/glossary/';
}

const BY_NAME = new Map(GLOSSARY.map((t) => [t.term.toLowerCase(), t]));

/** Case-insensitive lookup by term name (for inline <Term> tooltips). */
export function findTerm(name: string): GlossaryTerm | undefined {
	return BY_NAME.get(name.trim().toLowerCase());
}

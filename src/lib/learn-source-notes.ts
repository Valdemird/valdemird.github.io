// Reader-facing "why is this source here?" notes for the load-bearing sources
// of each module (the 3-4 the argument actually rests on). Keyed by
// `${slug}::${url-or-title}`. Powers the expandable panel in LearnSources.astro.
// Generated from the source-relevance curation pass — edit here to adjust copy.

export type Lang = 'en' | 'es';

export interface SourceNote {
	why: { en: string; es: string };
	reasons: { en: string[]; es: string[] };
}

export const SOURCE_NOTES: Record<string, SourceNote> = {
	"agent-as-policy::https://arxiv.org/abs/1011.0686": {
		why: { en: "This paper provides the module's real compounding-error theory: per-step error pushes a policy into unfamiliar states, so error grows quadratically (≈ εT²) with the horizon.", es: "Este paper aporta la teoría real de error acumulado del módulo: el error por paso empuja a la política hacia estados desconocidos, por lo que el error crece de forma cuadrática (≈ εT²) con el horizonte." },
		reasons: {
			en: ["Foundational, peer-reviewed imitation-learning result (Ross, Gordon & Bagnell); the rigorous theory the module cites over the p^t heuristic.", "Grounds the claim that compounding error is quadratic in horizon, not the back-of-envelope p^t multiplication.", "Justifies why verify-steps and HITL are forced by the math rather than optional polish."],
			es: ["Resultado fundacional y revisado por pares de imitation learning (Ross, Gordon & Bagnell); la teoría rigurosa que el módulo cita por encima de la heurística p^t.", "Fundamenta la afirmación de que el error acumulado es cuadrático en el horizonte, no la multiplicación aproximada p^t.", "Justifica por qué los verify-steps y el HITL los impone la matemática y no son un adorno opcional."],
		},
	},
	"agent-as-policy::https://arxiv.org/html/2509.02547v5": {
		why: { en: "This survey supplies the module's central formalism: the LLM agent as a stochastic policy over a POMDP, contrasted with the degenerate one-shot MDP of a single API call.", es: "Este survey aporta el formalismo central del módulo: el agente LLM como una política estocástica sobre un POMDP, frente al MDP de un solo paso de una llamada de API aislada." },
		reasons: {
			en: ["Primary survey of the agentic-RL field; the source the module names directly for the POMDP-vs-MDP framing.", "Grounds the core claim that an agent is π(action | observation, history) acting on a partially observed world, not 'an LLM with tools'.", "Backs the POMDP-to-engineering mapping (belief state, action space, transition, reward) the whole module is built on."],
			es: ["Survey primario del campo del agentic-RL; la fuente que el módulo cita directamente para el marco POMDP frente a MDP.", "Fundamenta la afirmación central de que un agente es π(action | observation, history) actuando sobre un mundo parcialmente observado, no 'un LLM con tools'.", "Respalda el mapeo de POMDP a ingeniería (belief state, espacio de acción, transición, recompensa) sobre el que se construye todo el módulo."],
		},
	},
	"agent-as-policy::https://arxiv.org/pdf/2509.09677": {
		why: { en: "This study establishes that near p ≈ 1, tiny per-step accuracy gains sharply extend the reachable horizon, so reliability per step dominates raw model capability on long tasks.", es: "Este estudio establece que cerca de p ≈ 1, pequeñas mejoras de precisión por paso extienden fuertemente el horizonte alcanzable, por lo que la fiabilidad por paso domina sobre la capacidad bruta del modelo en tareas largas." },
		reasons: {
			en: ["Primary 2025 measurement of long-horizon execution in LLMs; the empirical basis for the section's key result.", "Grounds the claim that going 99%→99.9% per step buys more horizon than swapping in a 'smarter' model.", "Supports the module's 'reliability per step ≫ capability' thesis that motivates engineering for reliability."],
			es: ["Medición primaria de 2025 de la ejecución de horizonte largo en LLMs; la base empírica del resultado clave de esa sección.", "Fundamenta la afirmación de que pasar de 99% a 99.9% por paso aporta más horizonte que cambiar a un modelo 'más inteligente'.", "Respalda la tesis del módulo 'fiabilidad por paso ≫ capacidad' que motiva ingeniar para la fiabilidad."],
		},
	},
	"agent-as-policy::https://www.anthropic.com/research/building-effective-agents": {
		why: { en: "This source defines the workflow-vs-agent distinction by who controls the trajectory, and supplies the five workflow patterns and the 'augmented LLM' atom the module leans on.", es: "Esta fuente define la distinción workflow-vs-agente según quién controla la trayectoria, y aporta los cinco patrones de workflow y el átomo del 'LLM aumentado' en los que se apoya el módulo." },
		reasons: {
			en: ["Primary engineering guidance from the lab that built these systems; the basis for 'who controls the trajectory'.", "Grounds the five named workflow patterns (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer).", "Source for the augmented-LLM base unit and the 'start simpler than an agent' decision ladder."],
			es: ["Guía de ingeniería primaria del lab que construyó estos sistemas; la base de 'quién controla la trayectoria'.", "Fundamenta los cinco patrones de workflow nombrados (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer).", "Fuente de la unidad base del augmented LLM y de la escalera de decisión 'empieza más simple que un agente'."],
		},
	},
	"agent-loop::https://arxiv.org/abs/2210.03629": {
		why: { en: "Grounds the think → act → observe cycle that the module reframes as the iteration mechanism, not the architecture itself.", es: "Fundamenta el ciclo think → act → observe que el módulo reencuadra como el mecanismo de iteración, no como la arquitectura en sí." },
		reasons: {
			en: ["The primary paper (Princeton/Google) that introduced and popularized the ReAct loop.", "Grounds the module's explicit distinction between the iteration cycle and the harness that actually decides reliability.", "Establishes interleaving reasoning with grounded action against the environment."],
			es: ["El paper primario (Princeton/Google) que introdujo y popularizó el loop ReAct.", "Fundamenta la distinción explícita del módulo entre el ciclo de iteración y el harness que realmente decide la fiabilidad.", "Establece el intercalado del razonamiento con acción fundamentada contra el entorno."],
		},
	},
	"agent-loop::https://arxiv.org/abs/2310.01798": {
		why: { en: "Grounds the 'ground truth beats self-reflection' claim: LLMs do not reliably self-correct reasoning without an external signal, and intrinsic self-correction can degrade output.", es: "Fundamenta la afirmación de que 'ground truth gana a la auto-reflexión': los LLMs no auto-corrigen el razonamiento de forma fiable sin una señal externa, y la auto-corrección intrínseca puede degradar el output." },
		reasons: {
			en: ["Peer-reviewed primary research from Google DeepMind, published at ICLR 2024.", "Directly supports the golden-rule claim that an iteration only helps if it injects an external verifier, never pure self-judgment.", "Explains the failure mechanism: the evaluator shares the generator's blind spots."],
			es: ["Investigación primaria revisada por pares de Google DeepMind, publicada en ICLR 2024.", "Respalda directamente la regla de oro: una iteración solo ayuda si inyecta un verificador externo, nunca el auto-juicio puro.", "Explica el mecanismo de fallo: el evaluador comparte los puntos ciegos del generador."],
		},
	},
	"agent-loop::https://arxiv.org/abs/2406.12045": {
		why: { en: "Grounds the measurement warning: for stochastic multi-turn agents, pass@1 lies, and consistency across k runs (pass^k) is what actually matters.", es: "Fundamenta la advertencia de medición: para agentes multi-turno estocásticos, pass@1 engaña, y lo que realmente importa es la consistencia entre k corridas (pass^k)." },
		reasons: {
			en: ["Primary benchmark paper from Sierra Research that introduced the pass^k metric.", "Grounds the module's claim that one green run means almost nothing for multi-turn systems.", "Also the source for the simulated-user and termination-tool patterns used in the termination section."],
			es: ["Paper de benchmark primario de Sierra Research que introdujo la métrica pass^k.", "Fundamenta la afirmación del módulo de que una corrida verde no significa casi nada en sistemas multi-turno.", "También es la fuente de los patrones de usuario simulado y termination tool usados en la sección de terminación."],
		},
	},
	"agent-loop::https://www.anthropic.com/engineering/building-effective-agents": {
		why: { en: "Establishes the module's core framing: agents are models using tools in a loop, and the hard part is the loop and control flow, not the model.", es: "Establece el marco central del módulo: los agentes son modelos que usan herramientas en un loop, y lo difícil es el loop y el control flow, no el modelo." },
		reasons: {
			en: ["Primary engineering guidance from Anthropic, the team building Claude and its agent tooling.", "Grounds the Model + Harness thesis and the workflows-vs-agents control-flow split the module builds on.", "Source for the advice to prefer the simplest design and delegate the minimum to the model."],
			es: ["Guía de ingeniería primaria de Anthropic, el equipo que construye Claude y su tooling de agentes.", "Fundamenta la tesis de Model + Harness y la división workflows-vs-agents sobre la que se apoya el módulo.", "Fuente del consejo de preferir el diseño más simple y delegar lo mínimo al modelo."],
		},
	},
	"context-engineering::https://arxiv.org/abs/2310.08560": {
		why: { en: "Anchors the module's core mental model — context window as RAM, external storage as disk, with the LLM doing the paging — that frames isolation, compaction, and externalized memory throughout.", es: "Ancla el modelo mental central del módulo — la ventana de contexto como RAM, el almacenamiento externo como disco, con el LLM haciendo el paging — que enmarca isolation, compaction y memoria externalizada en todo el texto." },
		reasons: {
			en: ["Primary research paper (UC Berkeley) that introduced the OS/paging framing for LLM context.", "Grounds the RAM-vs-disk model the module uses to motivate eviction, compaction, and externalized memory.", "Originates the short-term/long-term memory distinction the module formalizes."],
			es: ["Paper de investigación primario (UC Berkeley) que introdujo el encuadre de OS/paging para el contexto de un LLM.", "Fundamenta el modelo de RAM-vs-disco que el módulo usa para motivar eviction, compaction y memoria externalizada.", "Origina la distinción entre memoria de corto y largo plazo que el módulo formaliza."],
		},
	},
	"context-engineering::https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents": {
		why: { en: "Establishes the module's governing principle — context as a finite attention budget where you seek the smallest set of high-signal tokens — plus just-in-time retrieval and recall-first compaction.", es: "Establece el principio rector del módulo — el contexto como un presupuesto finito de atención donde buscas el conjunto más pequeño de tokens de alta señal — más just-in-time retrieval y compaction con recall primero." },
		reasons: {
			en: ["Primary source from Anthropic's Applied AI team, who build the agent harnesses this module describes.", "Grounds the core claim that context design is constrained optimization, not accumulation (the 'smallest set of high-signal tokens' line).", "Source for the compaction-as-lossy, maximize-recall-first guidance and just-in-time retrieval over pre-loading."],
			es: ["Fuente primaria del equipo Applied AI de Anthropic, que construye los harnesses de agentes que este módulo describe.", "Fundamenta la afirmación central de que el diseño de contexto es optimización con restricciones, no acumulación (la frase del 'conjunto más pequeño de tokens de alta señal').", "Fuente de la guía de compaction como operación con pérdida, maximizar recall primero, y just-in-time retrieval frente a precargar."],
		},
	},
	"context-engineering::https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html": {
		why: { en: "Supplies the diagnostic vocabulary the module builds its debugging section on — poisoning, distraction, confusion, clash — the taxonomy of why long context fails, not just that it does.", es: "Aporta el vocabulario de diagnóstico sobre el que el módulo construye su sección de depuración — poisoning, distraction, confusion, clash — la taxonomía de por qué falla el contexto largo, no solo de que falla." },
		reasons: {
			en: ["The original articulation of the four failure modes the module presents as its diagnostic framework.", "Grounds the central pedagogical move: separating 'that context rots' (Chroma) from 'why it rots' (this taxonomy).", "Each named pathology and its remedy in the module maps directly to this source."],
			es: ["La articulación original de los cuatro modos de fallo que el módulo presenta como su marco de diagnóstico.", "Fundamenta el giro pedagógico central: separar 'que el contexto se pudre' (Chroma) de 'por qué se pudre' (esta taxonomía).", "Cada patología nombrada y su remedio en el módulo corresponden directamente a esta fuente."],
		},
	},
	"context-engineering::https://www.trychroma.com/research/context-rot": {
		why: { en: "Provides the central empirical evidence that models use context non-uniformly, so accuracy — not just cost — degrades as input grows, with worse failures on semantic tasks and distractors.", es: "Aporta la evidencia empírica central de que los modelos usan el contexto de forma no uniforme, así que la precisión — no solo el costo — se degrada al crecer el input, con fallos peores en tareas semánticas y con distractores." },
		reasons: {
			en: ["Primary study evaluating 18 frontier models (Claude Opus 4, GPT-4.1, Gemini 2.5, Qwen3) — the people who ran the benchmarks.", "Grounds the module's anti-intuition thesis that more context degrades accuracy and that lexical NIAH hides real degradation.", "Source for the position-dependence and shuffled-haystack results the module flags as underused levers."],
			es: ["Estudio primario que evalúa 18 modelos frontier (Claude Opus 4, GPT-4.1, Gemini 2.5, Qwen3) — quienes corrieron los benchmarks.", "Fundamenta la tesis contraintuitiva del módulo de que más contexto degrada la precisión y que el NIAH léxico oculta la degradación real.", "Fuente de los resultados de dependencia de posición y de barajar el haystack que el módulo señala como palancas poco usadas."],
		},
	},
	"evaluation::https://arxiv.org/abs/2406.12045": {
		why: { en: "It supplies the hard data behind the module's central reliability claim: that mean pass@1 hides non-deterministic fragility a production agent can't ship with.", es: "Aporta los datos detrás de la afirmación central del módulo sobre fiabilidad: que el pass@1 promedio oculta una fragilidad no determinista con la que un agente en producción no puede salir a producción." },
		reasons: {
			en: ["Primary benchmark from the Sierra team that introduced pass^k for tool-agent-user tasks.", "Source of the exact figure the module leans on: GPT-4o at 61% pass@1 but 25% pass^8 in retail.", "Grounds the 'declaring ready on pass@1 is the antipattern' release-gate argument."],
			es: ["Benchmark primario del equipo de Sierra que introdujo pass^k para tareas tool-agent-user.", "Fuente de la cifra exacta en que se apoya el módulo: GPT-4o con 61% pass@1 pero 25% pass^8 en retail.", "Fundamenta el argumento de release gate de que 'declarar listo con pass@1 es el antipatrón'."],
		},
	},
	"evaluation::https://arxiv.org/pdf/2410.02736": {
		why: { en: "It establishes that an LLM judge is a biased instrument, supplying the catalog of biases the module's 'calibrate before you trust the judge' section is built on.", es: "Establece que un LLM judge es un instrumento sesgado, aportando el catálogo de sesgos sobre el que se construye la sección de 'calibra antes de confiar en el judge' del módulo." },
		reasons: {
			en: ["Primary study (CALM benchmark) that quantifies twelve systematic LLM-as-judge biases.", "Source for the position, verbosity, and self-preference biases the module names as the three that bite most.", "Grounds the module's insistence on calibration and bias mitigations rather than treating the judge as an oracle."],
			es: ["Estudio primario (benchmark CALM) que cuantifica doce sesgos sistemáticos del LLM-as-judge.", "Fuente de los sesgos de posición, verbosidad y self-preference que el módulo señala como los tres más dañinos.", "Fundamenta la insistencia del módulo en calibración y mitigación de sesgos en vez de tratar al judge como oráculo."],
		},
	},
	"evaluation::https://hamel.dev/blog/posts/evals-faq/why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed.html": {
		why: { en: "It is the methodological backbone of the module's opening argument: build graders from error analysis on real traces, not from metrics imagined a priori.", es: "Es la columna metodológica del argumento inicial del módulo: construir graders a partir de error analysis sobre trazas reales, no de métricas imaginadas a priori." },
		reasons: {
			en: ["Practitioner source the module explicitly credits for the 'error analysis first, graders second' inversion of TDD.", "Grounds the open-coding then axial-coding workflow the module teaches step by step.", "Supports the warning that a-priori evals produce vanity metrics against your own mental model."],
			es: ["Fuente de practicante que el módulo cita explícitamente por la inversión 'error analysis primero, graders después' frente al TDD.", "Fundamenta el flujo de open coding y luego axial coding que el módulo enseña paso a paso.", "Respalda la advertencia de que los evals a priori producen métricas de vanidad contra tu propio modelo mental."],
		},
	},
	"evaluation::https://proceedings.mlr.press/v267/patil25a.html": {
		why: { en: "It is the technical lineage for the module's code-based grader argument: AST matching of function calls and the relevance/restraint category, no LLM in the loop.", es: "Es el linaje técnico del argumento del módulo sobre graders por código: AST matching de llamadas a funciones y la categoría de relevance/restraint, sin LLM en el lazo." },
		reasons: {
			en: ["Primary source that introduced AST matching of generated vs expected function calls at scale.", "Origin of the restraint/relevance grader the module promotes (detecting when an agent should NOT call a tool).", "Grounds the claim that a large share of evaluation is deterministic, reproducible, and bias-free in code."],
			es: ["Fuente primaria que introdujo el AST matching de llamadas generadas vs esperadas a escala.", "Origen del grader de restraint/relevance que el módulo promueve (detectar cuándo un agente NO debe llamar a una herramienta).", "Fundamenta que gran parte de la evaluación es determinista, reproducible y sin sesgo en código."],
		},
	},
	"frontier::https://arxiv.org/abs/2505.22954": {
		why: { en: "Establishes that self-improvement works empirically only when each change is scored against a verifiable benchmark, lifting SWE-bench 20%→50% and Polyglot 14.2%→30.7%.", es: "Establece que la auto-mejora funciona empíricamente solo cuando cada cambio se evalúa contra un benchmark verificable, elevando SWE-bench 20%→50% y Polyglot 14.2%→30.7%." },
		reasons: {
			en: ["Primary research paper (Zhang et al., Sakana AI / UBC / Vector Institute) reporting the DGM results.", "Grounds the module's core isomorphism claim: the grader is the ceiling of self-improvement.", "Source of the generate→measure→archive pattern that the module contrasts with unbounded recursive rewriting."],
			es: ["Artículo de investigación primario (Zhang et al., Sakana AI / UBC / Vector Institute) que reporta los resultados de DGM.", "Fundamenta la afirmación central del isomorfismo del módulo: el grader es el techo de la auto-mejora.", "Origen del patrón generar→medir→archivar que el módulo contrasta con la reescritura recursiva sin límites."],
		},
	},
	"frontier::https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/": {
		why: { en: "Supplies the module's one credible quantitative trend: the task length agents finish at ~50% reliability doubles roughly every seven months, with o3 around 110 minutes.", es: "Aporta la única tendencia cuantitativa creíble del módulo: la duración de tarea que los agentes completan con ~50% de fiabilidad se duplica cada siete meses aproximadamente, con o3 en torno a 110 minutos." },
		reasons: {
			en: ["Primary measurement by METR, the team that defined and runs the task time-horizon benchmark.", "Directly grounds the central claim that the honest frontier metric is time-horizon, not single-turn IQ.", "Source of the concrete anchors the module designs against (doubling cadence, o3 at ~110 min)."],
			es: ["Medición primaria de METR, el equipo que definió y ejecuta el benchmark de task time-horizon.", "Fundamenta directamente la afirmación central de que la métrica honesta de la frontera es el time-horizon, no el IQ de un solo turno.", "Origen de las anclas concretas con las que diseña el módulo (cadencia de duplicación, o3 a ~110 min)."],
		},
	},
	"frontier::https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents": {
		why: { en: "Grounds the closing argument that sustained coherence, not prompt wording, is the bottleneck: curating high-signal tokens into a finite attention budget via compaction, note-taking, and clean-context sub-agents.", es: "Fundamenta el argumento de cierre de que el cuello de botella es la coherencia sostenida, no la redacción del prompt: curar tokens de alta señal en un presupuesto de atención finito mediante compaction, note-taking y sub-agentes con contexto limpio." },
		reasons: {
			en: ["Primary engineering guidance from Anthropic, who build production agents on these patterns.", "Grounds the module's claim that time-horizon is capped by context curation, not raw model capability.", "Source for the compaction / structured note-taking / sub-agent scaffolding the module recommends."],
			es: ["Guía de ingeniería primaria de Anthropic, que construye agentes en producción sobre estos patrones.", "Fundamenta la afirmación del módulo de que el time-horizon está limitado por la curación de contexto, no por la capacidad bruta del modelo.", "Origen del andamiaje de compaction / structured note-taking / sub-agentes que recomienda el módulo."],
		},
	},
	"human-in-the-loop::https://arxiv.org/pdf/2504.11168": {
		why: { en: "Shows injection and jailbreak detectors can be evaded systematically (up to 100% success), which is why safety classifiers cannot serve as the security boundary.", es: "Muestra que los detectores de injection y jailbreak pueden evadirse sistemáticamente (hasta 100% de éxito), por lo que los clasificadores de seguridad no pueden ser la frontera de seguridad." },
		reasons: {
			en: ["Empirical 2025 evasion study with measured success rates, not anecdote.", "Grounds the claim that prompt-level mitigations are probabilistic and the real boundary must be deterministic and external to the model.", "Directly supports rejecting safety classifiers as the primary guardrail."],
			es: ["Estudio empírico de evasión de 2025 con tasas de éxito medidas, no anécdota.", "Fundamenta la afirmación de que las mitigaciones a nivel de prompt son probabilísticas y la frontera real debe ser determinista y externa al modelo.", "Respalda directamente el rechazo de los clasificadores de seguridad como guardrail principal."],
		},
	},
	"human-in-the-loop::https://code.claude.com/docs/en/agent-sdk/permissions": {
		why: { en: "Defines the exact permission chain (deny > ask > mode > allow > callback) and mode behaviors the module builds its deterministic control system on.", es: "Define la cadena de permisos exacta (deny > ask > mode > allow > callback) y el comportamiento de los modos sobre los que el módulo construye su sistema de control determinista." },
		reasons: {
			en: ["Primary vendor documentation for the SDK whose mechanics the module describes claim-by-claim.", "Grounds the specific claims: deny/ask survive bypassPermissions, allow does not restrict, acceptEdits auto-approves Bash filesystem ops.", "Source for mode inheritance by subagents and the canUseTool callback being default-only."],
			es: ["Documentación primaria del proveedor para el SDK cuya mecánica el módulo describe afirmación por afirmación.", "Fundamenta las claims específicas: deny/ask sobreviven a bypassPermissions, allow no restringe, acceptEdits auto-aprueba ops de filesystem por Bash.", "Fuente de la herencia de modo por subagentes y de que el callback canUseTool solo aplica en default."],
		},
	},
	"human-in-the-loop::https://www.anthropic.com/research/agentic-misalignment": {
		why: { en: "Provides the evidence that a model with autonomy and sensitive access can take harmful actions, motivating a hard external rail rather than trusting alignment.", es: "Aporta la evidencia de que un modelo con autonomía y acceso sensible puede tomar acciones dañinas, lo que motiva una barrera externa dura en vez de confiar en la alineación." },
		reasons: {
			en: ["First-party Anthropic study; the blackmail 55%-vs-6.5% (real vs evaluated) figures come directly from it.", "Grounds the 'don't trust the model's alignment as the boundary' argument in the guardrail section.", "The module also uses it honestly to note the behavior was in earlier models, fixed since Claude Haiku 4.5."],
			es: ["Estudio de primera mano de Anthropic; las cifras de chantaje 55% vs 6.5% (real vs evaluado) provienen directamente de él.", "Fundamenta el argumento de 'no confíes en la alineación del modelo como frontera' en la sección de guardrails.", "El módulo también lo usa con honestidad para señalar que el comportamiento fue en modelos previos, corregido desde Claude Haiku 4.5."],
		},
	},
	"human-in-the-loop::https://www.anthropic.com/research/measuring-agent-autonomy": {
		why: { en: "Supplies the production distribution — ~0.8% of actions irreversible, 73% with a human in the loop, 80% with a safeguard — that justifies gating only the costly-to-undo tail.", es: "Aporta la distribución en producción — ~0.8% de las acciones irreversibles, 73% con un humano en el loop, 80% con algún resguardo — que justifica gatear solo la cola costosa de deshacer." },
		reasons: {
			en: ["First-party measurement by Anthropic across ~998K real production tool calls, not a synthetic benchmark.", "Grounds the module's central reversibility thesis: the control belongs on the ~1% irreversible tail.", "The post itself warns these are averages hiding less-safe frontier deployments, which the module quotes faithfully."],
			es: ["Medición de primera mano de Anthropic sobre ~998K llamadas de herramientas reales en producción, no un benchmark sintético.", "Fundamenta la tesis central de reversibilidad del módulo: el control va en la cola irreversible del ~1%.", "El propio artículo advierte que son promedios que ocultan despliegues frontier menos seguros, tal como el módulo lo cita."],
		},
	},
	"llm-substrate::http://www.incompleteideas.net/IncIdeas/BitterLesson.html": {
		why: { en: "Supplies the decision criterion the module closes on: general methods that scale with compute beat hand-engineered domain knowledge over time.", es: "Aporta el criterio de decisión con el que cierra el módulo: los métodos generales que escalan con cómputo superan con el tiempo al conocimiento de dominio hecho a mano." },
		reasons: {
			en: ["Primary essay by Rich Sutton stating the scaling-over-engineering thesis in its original form.", "Grounds the module's build-vs-leave-to-the-model criterion — that scaffolding patching a model limitation is debt the next generation erases."],
			es: ["Ensayo primario de Rich Sutton que enuncia en su forma original la tesis de escalar-sobre-ingeniería.", "Fundamenta el criterio del módulo de construir-vs-dejar-al-modelo: el scaffolding que parchea una limitación del modelo es deuda que la próxima generación borra."],
		},
	},
	"llm-substrate::https://arxiv.org/abs/2307.03172": {
		why: { en: "Documents the U-shaped recall curve where models retrieve content at the start and end of context well but lose what sits in the middle.", es: "Documenta la curva de recall en forma de U: los modelos recuperan bien lo que está al inicio y al final del contexto, pero pierden lo que queda en el medio." },
		reasons: {
			en: ["Primary empirical study (Stanford) measuring positional recall on multi-document QA — the source of the 'lost in the middle' shape.", "Grounds the module's core thesis that context is a finite attention budget, not storage, and its caution against the folklore '30-60%' figure."],
			es: ["Estudio empírico primario (Stanford) que mide el recall por posición en QA multi-documento — el origen de la forma 'lost in the middle'.", "Fundamenta la tesis central del módulo de que el contexto es un presupuesto finito de atención, no almacenamiento, y su advertencia sobre la cifra folclórica del '30-60%'."],
		},
	},
	"llm-substrate::https://arxiv.org/abs/2501.12948": {
		why: { en: "Provides the reference recipe — RL with verifiable rewards (GRPO) — behind the claim that tool-use and reasoning are trained behavior, not prompt magic.", es: "Aporta la receta de referencia — RL con recompensas verificables (GRPO) — detrás de la afirmación de que el uso de herramientas y el razonamiento son comportamiento entrenado, no magia de prompts." },
		reasons: {
			en: ["Primary model paper documenting that pure RL on a base model (R1-Zero) induces reasoning, while shipped R1 adds a cold-start SFT stage.", "Grounds the module's 'tool-use is trained, not prompted' section and its precise R1 vs R1-Zero correction."],
			es: ["Artículo primario del modelo que documenta que el RL puro sobre un modelo base (R1-Zero) induce razonamiento, mientras que el R1 publicado añade una etapa de SFT de arranque en frío.", "Fundamenta la sección 'el uso de herramientas se entrena, no se promptea' y su corrección precisa de R1 vs R1-Zero."],
		},
	},
	"llm-substrate::https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html": {
		why: { en: "Establishes that in-context learning is driven by a concrete attention mechanism — induction heads — rather than the model 'understanding' instructions.", es: "Establece que el in-context learning surge de un mecanismo de atención concreto — las induction heads — y no de que el modelo 'entienda' las instrucciones." },
		reasons: {
			en: ["Primary mechanistic-interpretability paper from the Anthropic team that discovered induction heads and the training phase change.", "Directly grounds the module's claim that canonical few-shot examples work by activating a learned copy-and-generalize circuit."],
			es: ["Artículo primario de interpretabilidad mecanicista del equipo de Anthropic que descubrió las induction heads y el cambio de fase durante el entrenamiento.", "Fundamenta directamente la afirmación del módulo de que los ejemplos few-shot funcionan al activar un circuito aprendido de copiar-y-generalizar."],
		},
	},
	"memory::https://arxiv.org/abs/2309.02427": {
		why: { en: "CoALA supplies the module's organizing taxonomy: the four memory types (working, episodic, semantic, procedural), each demanding its own write, retrieval, and decay policy.", es: "CoALA aporta la taxonomía que organiza el módulo: los cuatro tipos de memoria (working, episodic, semantic, procedural), cada uno con su propia política de escritura, recuperación y decaimiento." },
		reasons: {
			en: ["Primary academic source (Princeton) that adapts Tulving's taxonomy to language agents.", "Grounds the 'confusing types' root error and the per-type policy table.", "Frames the internal-vs-external action split the module builds on."],
			es: ["Fuente académica primaria (Princeton) que adapta la taxonomía de Tulving a los language agents.", "Sustenta el error raíz de 'confundir tipos' y la tabla de políticas por tipo.", "Plantea la separación entre acciones internas y externas en la que se apoya el módulo."],
		},
	},
	"memory::https://arxiv.org/abs/2310.08560": {
		why: { en: "MemGPT establishes the OS-style memory hierarchy (context as RAM, external store as disk) where the agent itself pages information between levels via tool-use.", es: "MemGPT establece la jerarquía de memoria estilo SO (contexto como RAM, almacén externo como disco) donde el propio agente pagina información entre niveles mediante tool-use." },
		reasons: {
			en: ["Primary source (UC Berkeley / Letta) for the RAM/disk core/recall/archival model.", "Grounds the claim that memory management is tool-use the model decides, not passive pre-loading.", "The hierarchy nearly every later framework rests on."],
			es: ["Fuente primaria (UC Berkeley / Letta) del modelo RAM/disco core/recall/archival.", "Sustenta la afirmación de que gestionar memoria es tool-use que decide el modelo, no pre-carga pasiva.", "La jerarquía sobre la que se apoya casi todo framework posterior."],
		},
	},
	"memory::https://arxiv.org/abs/2503.03704": {
		why: { en: "MINJA proves memory poisoning is a persistent, query-only attack: a benign-looking write becomes a multi-session backdoor triggered when another victim retrieves it.", es: "MINJA demuestra que el memory poisoning es un ataque persistente y solo por queries: una escritura aparentemente benigna se vuelve un backdoor multi-sesión que se dispara cuando otra víctima la recupera." },
		reasons: {
			en: ["Primary attack paper showing >95% injection / ~70%+ end-to-end success with no privileged access.", "Grounds the central claim that a poisoned memory is strictly worse than a one-turn injection.", "Demonstrates the persistence that couples memory to security across sessions."],
			es: ["Paper primario de ataque que muestra >95% de inyección / ~70%+ end-to-end sin acceso privilegiado.", "Sustenta la afirmación central de que una memoria envenenada es estrictamente peor que una inyección de un solo turno.", "Demuestra la persistencia que liga la memoria a la seguridad a través de sesiones."],
		},
	},
	"memory::https://arxiv.org/html/2606.04329v1": {
		why: { en: "This is the source behind the module's security thesis: the write-path as trust boundary, with six poisoning classes and four write channels (C1-C4).", es: "Esta es la fuente detrás de la tesis de seguridad del módulo: el write-path como frontera de confianza, con seis clases de poisoning y cuatro canales de escritura (C1-C4)." },
		reasons: {
			en: ["Systematic study that defines the four write channels and six poisoning classes.", "Grounds the ~84%→~42% input-detection drop on weak-signal attacks.", "Supports the source-aware / provenance defense and narrow-policy attack-rate figures."],
			es: ["Estudio sistemático que define los cuatro canales de escritura y seis clases de poisoning.", "Sustenta la caída de detección ~84%→~42% en ataques de señal débil.", "Respalda la defensa source-aware / provenance y las cifras de política estricta."],
		},
	},
	"multi-agent::https://arxiv.org/abs/2503.13657": {
		why: { en: "Establishes the module's claim that most multi-agent failures come from system design and inter-agent misalignment, not model limits.", es: "Establece la afirmación del módulo de que la mayoría de las fallas multi-agente vienen del diseño del sistema y de la falta de alineación entre agentes, no de los límites del modelo." },
		reasons: {
			en: ["Peer-reviewed primary study (NeurIPS 2025) analyzing 1600+ traces across 7 frameworks with strong inter-annotator agreement.", "Source of the 14-failure-mode MAST taxonomy and the ~42% / ~37% / ~21% category weights in the table.", "Grounds the operational claim that a better model does not fix a badly designed multi-agent system."],
			es: ["Estudio primario revisado por pares (NeurIPS 2025) que analiza más de 1600 trazas en 7 frameworks con fuerte acuerdo entre anotadores.", "Fuente de la taxonomía MAST de 14 modos de falla y de los pesos ~42% / ~37% / ~21% de la tabla.", "Fundamenta la afirmación operativa de que un mejor modelo no arregla un sistema multi-agente mal diseñado."],
		},
	},
	"multi-agent::https://cognition.com/blog/dont-build-multi-agents": {
		why: { en: "Provides the core mechanism the module hinges on — actions carry implicit decisions, and conflicting implicit decisions make write-fan-out break (the Flappy Bird example).", es: "Aporta el mecanismo central sobre el que gira el módulo: las acciones cargan decisiones implícitas, y las decisiones implícitas en conflicto rompen el fan-out de escritura (el ejemplo de Flappy Bird)." },
		reasons: {
			en: ["Primary source for the read/write asymmetry and the 'conflicting implicit decisions' argument the module calls its hinge.", "First-hand position from Cognition; the module uses it as one of the two reconciled camps.", "Grounds the antipattern that trimming context to save tokens produces incoherent synthesized output."],
			es: ["Fuente primaria de la asimetría lectura/escritura y del argumento de 'decisiones implícitas en conflicto' que el módulo llama su bisagra.", "Posición de primera mano de Cognition; el módulo la usa como uno de los dos campos que reconcilia.", "Fundamenta el antipatrón de recortar contexto para ahorrar tokens y producir una salida sintetizada incoherente."],
		},
	},
	"multi-agent::https://www.anthropic.com/engineering/building-effective-agents": {
		why: { en: "Provides the workflows-vs-agents taxonomy and the 'start with the simplest thing, add agents only when justified' rule that frames the module's whole escalation ladder.", es: "Aporta la taxonomía de workflows frente a agentes y la regla de 'empieza con lo más simple, añade agentes solo cuando se justifique' que enmarca toda la escalera de escalamiento del módulo." },
		reasons: {
			en: ["Primary source defining the canonical taxonomy (prompt chaining, routing, parallelization, orchestrator-worker, evaluator-optimizer).", "Grounds the escalation-ladder code block and the golden rule that holds up the topic's core discipline.", "Source for the evaluator-optimizer pattern cited in the verification section."],
			es: ["Fuente primaria que define la taxonomía canónica (prompt chaining, routing, paralelización, orchestrator-worker, evaluator-optimizer).", "Fundamenta el bloque de la escalera de escalamiento y la regla de oro que sostiene la disciplina central del tema.", "Fuente del patrón evaluator-optimizer citado en la sección de verificación."],
		},
	},
	"multi-agent::https://www.anthropic.com/engineering/built-multi-agent-research-system": {
		why: { en: "Supplies the module's central numbers — that multi-agent spends roughly 15x the tokens and that token usage alone explains about 80% of performance variance.", es: "Aporta las cifras centrales del módulo: que multi-agente gasta cerca de 15x los tokens y que el uso de tokens por sí solo explica alrededor del 80% de la varianza de rendimiento." },
		reasons: {
			en: ["Primary engineering write-up from the team that built and measured the system, not a secondary summary.", "Grounds the claim that multi-agent is mostly buying compute, and the ~15x cost figure in the cost table.", "Source of the orchestrator-worker pattern with explicit per-subtask effort budgets."],
			es: ["Reporte de ingeniería de primera mano del equipo que construyó y midió el sistema, no un resumen secundario.", "Fundamenta la afirmación de que multi-agente es sobre todo comprar cómputo, y la cifra de ~15x en la tabla de costo.", "Fuente del patrón orchestrator-worker con presupuestos de esfuerzo explícitos por subtarea."],
		},
	},
	"observability::https://arxiv.org/abs/2604.22708": {
		why: { en: "Supplies the empirical basis for making observability an architecture requirement: full traces lift step-level failure attribution by a relative +76%, so the agent must emit input context per step, not output only.", es: "Aporta la base empírica para hacer de la observabilidad un requisito de arquitectura: los traces completos elevan la atribución de fallos a nivel de paso en un +76% relativo, así que el agente debe emitir el contexto de entrada por paso, no solo la salida." },
		reasons: {
			en: ["Benchmark paper measuring failure attribution with full vs partial traces across multi-agent systems", "Grounds the 'capture input context per step' section and the +76% step-level attribution figure", "Module cites it carefully, flagging which numbers come from different configurations"],
			es: ["Paper de benchmark que mide la atribución de fallos con traces completos vs parciales en sistemas multi-agente", "Sustenta la sección 'capturar el contexto de entrada por paso' y la cifra de +76% de atribución a nivel de paso", "El módulo lo cita con cuidado, señalando qué números provienen de configuraciones distintas"],
		},
	},
	"observability::https://opentelemetry.io/blog/2026/genai-observability/": {
		why: { en: "Defines the vendor-neutral GenAI semantic conventions this module treats as the lingua franca for naming spans, structuring the turn trace as a span tree, and keeping content (prompts, tool-args) opt-in.", es: "Define las convenciones semánticas GenAI, neutrales respecto al proveedor, que este módulo trata como lingua franca para nombrar spans, estructurar el turn trace como árbol de spans y mantener el contenido (prompts, tool-args) como opt-in." },
		reasons: {
			en: ["Primary CNCF/OpenTelemetry spec, the schema adopted by Datadog, AWS, Azure and GCP", "Grounds the claim that instrumenting with semconv lets you swap backend without reinstrumenting", "Source for the gen_ai.* attributes and the content opt-in / redaction privacy stance"],
			es: ["Especificación primaria de CNCF/OpenTelemetry, el esquema adoptado por Datadog, AWS, Azure y GCP", "Sustenta la afirmación de que instrumentar con semconv permite cambiar de backend sin reinstrumentar", "Fuente de los atributos gen_ai.* y de la postura de privacidad de contenido opt-in / redacción"],
		},
	},
	"observability::https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/": {
		why: { en: "Establishes the module's core thesis that temperature=0 is not reproducible: non-determinism is an infrastructure property of GPU kernels, which is why you debug with replay over recorded tool-responses.", es: "Establece la tesis central del módulo de que temperature=0 no es reproducible: el no-determinismo es una propiedad de infraestructura de los kernels de GPU, por lo que se depura con replay sobre tool-responses grabadas." },
		reasons: {
			en: ["Primary technical write-up from Thinking Machines Lab tracing non-determinism to kernel batch-invariance", "Grounds the claim that identical input at temp=0 yields different output due to concurrent batch size", "Justifies the 'replay over recorded tool-responses' design instead of re-running and hoping"],
			es: ["Artículo técnico primario de Thinking Machines Lab que rastrea el no-determinismo hasta la batch-invariance de los kernels", "Sustenta la afirmación de que la misma entrada a temp=0 produce salidas distintas por el batch size concurrente", "Justifica el diseño de 'replay sobre tool-responses grabadas' en lugar de re-ejecutar y esperar"],
		},
	},
	"observability::https://www.anthropic.com/engineering/multi-agent-research-system": {
		why: { en: "Provides the production evidence that token cost is a primary quality signal, not finance: tokens explain ~80% of performance variance and multi-agent systems use on the order of 15x the tokens of a chat.", es: "Aporta la evidencia de producción de que el costo en tokens es una señal primaria de calidad, no finanzas: los tokens explican ~80% de la varianza de desempeño y los sistemas multi-agente usan del orden de 15x los tokens de un chat." },
		reasons: {
			en: ["First-party Anthropic Engineering report from a real deployed multi-agent system", "Grounds the 'cost is a primary signal' section and the 80% variance / 15x tokens figures", "Backs wiring token-per-turn into evals as a regression grader"],
			es: ["Informe de primera mano de Anthropic Engineering sobre un sistema multi-agente real en producción", "Sustenta la sección 'el costo es una señal primaria' y las cifras de 80% de varianza / 15x tokens", "Respalda integrar tokens-por-turno en los evals como grader de regresión"],
		},
	},
	"post-training-rl::https://arxiv.org/abs/2506.11425": {
		why: { en: "Establishes that RLVR degrades in multi-turn agentic settings because the reward is sparse, and that agent guidance recovers it on SWE-Bench.", es: "Establece que RLVR se degrada en entornos agenticos multi-turno porque la recompensa es dispersa, y que la agent guidance lo recupera en SWE-Bench." },
		reasons: {
			en: ["Primary paper introducing agent guidance for sparse-reward agentic RL.", "Grounds the module's claim that RLVR degrades under trajectory-level sparsity.", "Source of the Qwen-2.5-72B 9.4%→22.4% SWE-Bench Verified figure."],
			es: ["Paper primario que introduce la agent guidance para RL agentico de recompensa dispersa.", "Sostiene la afirmacion del modulo de que RLVR se degrada bajo la dispersion a nivel de trayectoria.", "Fuente de la cifra Qwen-2.5-72B 9.4%→22.4% en SWE-Bench Verified."],
		},
	},
	"post-training-rl::https://arxiv.org/html/2510.01132v1": {
		why: { en: "Grounds the credit-assignment section: the SFT:RL ratio intuition and the caveat that dense-vs-sparse reward effects are algorithm-dependent, not a universal law.", es: "Sostiene la seccion de credit assignment: la intuicion del ratio SFT:RL y la advertencia de que los efectos de recompensa densa vs dispersa dependen del algoritmo, no son una ley universal." },
		reasons: {
			en: ["Practitioner-focused primary guide on multi-turn agentic RL from UC San Diego.", "Source of the 60 SFT + 400 RL ≈ 5000 pure RL episodes figure for cold-start value.", "Grounds the warning that dense reward (58% vs 41%) is PPO-specific while RLOO stays stable."],
			es: ["Guia primaria orientada al practicante sobre RL agentico multi-turno, de UC San Diego.", "Fuente de la cifra 60 SFT + 400 RL ≈ 5000 episodios de RL puro sobre el valor del cold-start.", "Sostiene la advertencia de que la recompensa densa (58% vs 41%) es especifica de PPO mientras RLOO se mantiene estable."],
		},
	},
	"post-training-rl::https://rlhfbook.com/c/13-cai": {
		why: { en: "Grounds the layer-2 alignment account and the key claim that Claude's safety hard-rails are etched in the weights, not overridable from the context.", es: "Sostiene el relato de alineamiento de la capa 2 y la afirmacion clave de que los hard-rails de seguridad de Claude estan grabados en los pesos, no anulables desde el contexto." },
		reasons: {
			en: ["Anthropic's own method (Bai et al. 2022) — the people who built the technique the module describes.", "Grounds the claim that CAI was the first large-scale instance of RL from AI feedback.", "Source for 'safety limits are trained into weights, a system-prompt persona cannot override them'."],
			es: ["Metodo propio de Anthropic (Bai et al. 2022) — quienes construyeron la tecnica que el modulo describe.", "Sostiene la afirmacion de que CAI fue la primera instancia a gran escala de RL a partir de feedback de IA.", "Fuente de 'los limites de seguridad estan entrenados en los pesos; una persona en el system prompt no puede anularlos'."],
		},
	},
	"post-training-rl::https://www.nature.com/articles/s41586-025-09422-z": {
		why: { en: "This is the primary result the module's RLVR section rests on: pure RL on verifiable rewards made chain-of-thought, self-correction, and the AIME jump emerge.", es: "Es el resultado primario sobre el que descansa la seccion de RLVR del modulo: RL puro sobre recompensas verificables hizo emerger el chain-of-thought, la auto-correccion y el salto en AIME." },
		reasons: {
			en: ["Primary paper from the DeepSeek team, peer-reviewed in Nature, that ran the R1-Zero ablation.", "Grounds the 'reasoning emerged from pure RL, no SFT' claim and the 15.6%→71% AIME figure.", "Source of the 'SFT cold-start → verifiable RL → distillation' recipe and GRPO as reference pattern."],
			es: ["Paper primario del equipo DeepSeek, revisado por pares en Nature, que ejecuto la ablacion R1-Zero.", "Sostiene la afirmacion 'el razonamiento emergio de RL puro, sin SFT' y la cifra de AIME 15.6%→71%.", "Fuente de la receta 'SFT cold-start → RL verificable → distilacion' y de GRPO como patron de referencia."],
		},
	},
	"production::https://arxiv.org/pdf/2509.08646": {
		why: { en: "It grounds the structural separation of control and execution planes and the freeze-the-action-at-approval-time discipline for human-in-the-loop pauses.", es: "Sustenta la separación estructural de los planos de control y ejecución, y la disciplina de congelar la acción al momento de aprobación en las pausas con human-in-the-loop." },
		reasons: {
			en: ["Peer-style architectural guide focused on resilient, plan-then-execute agent implementations.", "Grounds the edge-vs-worker split (validate/persist/enqueue separated from the slow model call).", "Supports persisting the normalized input at approval time so executed equals shown, avoiding action drift."],
			es: ["Guía arquitectónica enfocada en implementaciones de agentes resilientes con plan-then-execute.", "Sustenta la división edge-vs-worker (validar/persistir/encolar separado de la llamada lenta al modelo).", "Respalda persistir el input normalizado al momento de aprobación para que lo ejecutado iguale lo mostrado, evitando drift de la acción."],
		},
	},
	"production::https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents": {
		why: { en: "It grounds the reliability framing of this module: measure agents against real persisted state, not the model's claim, and distinguish capability from per-run reliability.", es: "Sustenta el enfoque de fiabilidad de este módulo: medir agentes contra el estado real persistido, no contra lo que afirma el modelo, y distinguir capacidad de fiabilidad por ejecución." },
		reasons: {
			en: ["Primary engineering guidance from the model provider on how to evaluate agents correctly.", "Grounds the 'database is the source of truth, not the agent' claim and the pass@k vs pass^k distinction.", "Supports checking the row that should exist rather than the sentence the model emitted."],
			es: ["Guía de ingeniería primaria del proveedor del modelo sobre cómo evaluar agentes correctamente.", "Sustenta la afirmación de que 'la base de datos es la fuente de verdad, no el agente' y la distinción pass@k vs pass^k.", "Respalda verificar la fila que debería existir en lugar de la frase que emitió el modelo."],
		},
	},
	"production::https://www.anthropic.com/research/building-effective-agents": {
		why: { en: "It establishes the baseline agent-as-a-loop-in-code frame that this module extends into a durable distributed workflow.", es: "Establece el marco base del agente como un loop en código que este módulo extiende hacia un workflow distribuido y durable." },
		reasons: {
			en: ["Primary engineering reference from the model provider defining the agent control loop.", "Grounds the module's opening frame that the loop (call model, run tool, feed result back) is correct but runs on crashing, retrying infrastructure.", "Anchors the distinction between the easy agent loop and the hard surrounding workflow."],
			es: ["Referencia de ingeniería primaria del proveedor del modelo que define el loop de control del agente.", "Sustenta el marco inicial del módulo: el loop (llamar al modelo, ejecutar la herramienta, retroalimentar) es correcto pero corre sobre infraestructura que falla y reintenta.", "Ancla la distinción entre el loop fácil del agente y el workflow difícil que lo rodea."],
		},
	},
	"production::https://www.inngest.com/blog/durable-execution-key-to-harnessing-ai-agents": {
		why: { en: "It establishes the durable-execution pattern at the spine of this module: persist each completed step, replay on crash, and resume from the last checkpoint.", es: "Establece el patrón de durable execution que es la columna de este módulo: persistir cada paso completado, hacer replay tras un crash y resumir desde el último checkpoint." },
		reasons: {
			en: ["From a vendor that builds a durable workflow engine, describing the memoization-and-replay mechanism firsthand.", "Grounds the 'persist state, resume from checkpoint' claim and the worker.ts step.run example.", "Supports the warning that retries alone, without memoization, re-charge tokens and double-execute writes."],
			es: ["De un proveedor que construye un motor de workflows durables, describiendo de primera mano el mecanismo de memoización y replay.", "Sustenta la afirmación de 'persistir estado, resumir desde el checkpoint' y el ejemplo step.run en worker.ts.", "Respalda la advertencia de que los retries por sí solos, sin memoización, recobran tokens y duplican escrituras."],
		},
	},
	"reasoning::https://arxiv.org/abs/2201.11903": {
		why: { en: "The origin point the module argues against: it introduced CoT as a prompting trick, which native reasoning models later turned into a trained capability.", es: "El punto de origen contra el que argumenta el módulo: introdujo la CoT como truco de prompting, que los reasoning models nativos luego convirtieron en una capacidad entrenada." },
		reasons: {
			en: ["Seminal paper that defined chain-of-thought prompting, the 2023-era practice the module tells you to stop copying.", "Grounds the framing that reasoning shifted from a prompting trick to an RL-trained capability."],
			es: ["Paper seminal que definió el chain-of-thought prompting, la práctica de la era 2023 que el módulo te dice que dejes de copiar.", "Fundamenta el marco de que el razonamiento pasó de truco de prompting a capacidad entrenada con RL."],
		},
	},
	"reasoning::https://arxiv.org/abs/2408.03314": {
		why: { en: "Establishes the module's core scaling lever: compute-optimal test-time compute can substitute for pretraining and beat a much larger model on some problems.", es: "Establece la palanca de escalado central del módulo: el test-time compute óptimo puede sustituir al pretraining y superar a un modelo mucho más grande en algunos problemas." },
		reasons: {
			en: ["Primary study that measured the accuracy-vs-tokens tradeoff the module builds its 'one knob that matters' argument on.", "Directly grounds the claim that scaling reasoning tokens can beat a model many times larger.", "Source for the compute-optimal framing behind the underthink/elbow/overthink curve."],
			es: ["Estudio primario que midió el tradeoff accuracy-vs-tokens sobre el que el módulo construye su argumento del 'único knob que importa'.", "Fundamenta directamente que escalar reasoning tokens puede superar a un modelo muchas veces más grande.", "Fuente del enfoque compute-optimal detrás de la curva underthink/elbow/overthink."],
		},
	},
	"reasoning::https://www.anthropic.com/engineering/multi-agent-research-system": {
		why: { en: "Grounds the module's closing cost claims: multi-agent uses roughly 15x the tokens of a single chat and token usage explains about 80% of performance variance.", es: "Fundamenta las afirmaciones de costo del cierre del módulo: multi-agente usa cerca de 15x los tokens de un solo chat y el uso de tokens explica alrededor del 80% de la varianza de desempeño." },
		reasons: {
			en: ["First-party engineering report from the team that built and measured the system, not a third-party estimate.", "Grounds the specific 15x-token and ~80%-variance figures and the claim that multi-agent fails on interdependent work."],
			es: ["Reporte de ingeniería propio del equipo que construyó y midió el sistema, no una estimación de terceros.", "Fundamenta las cifras concretas de 15x tokens y ~80% de varianza y la afirmación de que multi-agente falla en trabajo interdependiente."],
		},
	},
	"reasoning::https://www.anthropic.com/research/measuring-faithfulness-in-chain-of-thought-reasoning": {
		why: { en: "Primary evidence for this module's central claim: the visible chain of thought is not a faithful trace of the model's real computation, so it has no security-audit value.", es: "Evidencia primaria de la afirmación central del módulo: la chain of thought visible no es un registro fiel del cómputo real del modelo, por lo que no sirve como auditoría de seguridad." },
		reasons: {
			en: ["First-party Anthropic research that ran the faithfulness experiments on reasoning models, not a secondary summary.", "Grounds the claim that a model obeys an injected hint without mentioning it, so CoT is no defense against prompt injection.", "Supports 'editing the reasoning text often doesn't change the answer' — the chain isn't the causal path."],
			es: ["Investigación propia de Anthropic que corrió los experimentos de fidelidad sobre reasoning models, no un resumen secundario.", "Fundamenta que el modelo obedece una pista inyectada sin mencionarla, por lo que la CoT no defiende contra prompt injection.", "Respalda que editar el texto de razonamiento a menudo no cambia la respuesta: la cadena no es el camino causal."],
		},
	},
	"retrieval::https://arxiv.org/abs/2404.16130": {
		why: { en: "This is the primary paper for the GraphRAG section: it defines the global-query capability vector RAG can't serve and the entity-graph plus community-summary construction the module describes.", es: "Es el paper primario de la sección GraphRAG: define la capacidad de consultas globales que el RAG vectorial no cubre y la construcción de grafo de entidades más resúmenes de comunidades que el módulo describe." },
		reasons: {
			en: ["Peer-reviewed primary source from Microsoft Research that introduced GraphRAG.", "Grounds the claim that GraphRAG answers global/corpus-wide queries via Leiden community detection and hierarchical summaries."],
			es: ["Fuente primaria revisada por pares de Microsoft Research que introdujo GraphRAG.", "Sustenta la afirmación de que GraphRAG responde consultas globales del corpus vía detección de comunidades Leiden y resúmenes jerárquicos."],
		},
	},
	"retrieval::https://www.anthropic.com/news/contextual-retrieval": {
		why: { en: "This establishes the concrete retrieval-failure numbers and the chunking insight the module leans on: that the problem was the chunk losing its context, not the embedding model.", es: "Establece las cifras concretas de fallo de recuperación y la idea sobre el chunking en que se apoya el módulo: que el problema era que el chunk perdía su contexto, no el modelo de embedding." },
		reasons: {
			en: ["Primary source from Anthropic publishing the technique and its measured results.", "Grounds the 49% (5.7%→2.9%) and 67% (→1.9%) failure-reduction figures, the $1.02/M preprocessing cost, and the ~200k-token threshold."],
			es: ["Fuente primaria de Anthropic que publica la técnica y sus resultados medidos.", "Sustenta las cifras de reducción de fallo del 49% (5.7%→2.9%) y 67% (→1.9%), el costo de preprocesamiento de $1.02/M y el umbral de ~200k tokens."],
		},
	},
	"retrieval::https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/": {
		why: { en: "This is the source for the specific cost-reduction figure the module uses to correct a commonly-conflated number: LazyGraphRAG cuts indexing cost to ~0.1% of full GraphRAG.", es: "Es la fuente de la cifra específica de reducción de costo que el módulo usa para corregir un número que suele confundirse: LazyGraphRAG reduce el costo de indexado a ~0.1% del GraphRAG completo." },
		reasons: {
			en: ["Primary source from Microsoft Research, the team behind GraphRAG and its variants.", "Grounds the ~1000x (~0.1%) indexing-cost figure and the module's care to not conflate it with LightRAG's ~6000x number."],
			es: ["Fuente primaria de Microsoft Research, el equipo detrás de GraphRAG y sus variantes.", "Sustenta la cifra de ~1000x (~0.1%) en costo de indexado y el cuidado del módulo de no confundirla con el número de ~6000x de LightRAG."],
		},
	},
	"retrieval::https://x.com/bcherny/status/2017824286489383315": {
		why: { en: "This is the primary account behind the module's core thesis: that Anthropic dropped embeddings from Claude Code because agentic search is simpler and avoids index staleness, privacy and reliability problems.", es: "Es el testimonio de primera mano detrás de la tesis central del módulo: que Anthropic retiró los embeddings de Claude Code porque la agentic search es más simple y evita los problemas de desincronización del índice, privacidad y fiabilidad." },
		reasons: {
			en: ["First-hand from a Claude Code maintainer at Anthropic — the team that actually made the switch.", "Grounds the central claim that 'the default flipped' and the 'index is a liability' section (staleness, privacy, no third-party copy)."],
			es: ["De primera mano de un maintainer de Claude Code en Anthropic: el equipo que realmente hizo el cambio.", "Sustenta la afirmación central de que 'el default cambió' y la sección 'el índice es un pasivo' (desincronización, privacidad, sin copia en terceros)."],
		},
	},
	"security::https://arxiv.org/abs/2406.13352": {
		why: { en: "This defines the measurement standard the module prescribes: a benchmark that reports utility, utility-under-attack, and attack-success-rate so you can gate releases on security, not just task success.", es: "Define el estándar de medición que el módulo prescribe: un benchmark que reporta utilidad, utilidad-bajo-ataque y attack-success-rate para poder condicionar los releases a la seguridad, no solo al éxito de la tarea." },
		reasons: {
			en: ["Primary benchmark from ETH Zurich; the harness CaMeL's results are measured against.", "Grounds the '97 tasks plus 629 security cases' figure and the 'gate releases on attack-success-rate' guidance.", "Supplies the shared yardstick that makes the module's defense comparisons meaningful."],
			es: ["Benchmark primario de ETH Zurich; el harness contra el que se miden los resultados de CaMeL.", "Fundamenta la cifra de '97 tareas más 629 casos de seguridad' y la guía de 'condicionar los releases al attack-success-rate'.", "Aporta la vara común que da sentido a las comparaciones de defensas del módulo."],
		},
	},
	"security::https://arxiv.org/abs/2510.09023": {
		why: { en: "This is the empirical basis for the module's central claim that no behavioral defense holds: adaptive attacks broke 12 published defenses, so detection is a dead end.", es: "Es la base empírica de la tesis central del módulo de que ninguna defensa conductual aguanta: ataques adaptativos rompieron 12 defensas publicadas, por lo que la detección es un callejón sin salida." },
		reasons: {
			en: ["Primary study from OpenAI, Anthropic and Google DeepMind red-teaming real published defenses, not a survey.", "Grounds the '>90% bypass, 100% with human red-teaming' figures and the '180-degree turn to containment' argument.", "Justifies why any '95% catch rate' metric is treated as a failing grade."],
			es: ["Estudio primario de OpenAI, Anthropic y Google DeepMind que ataca defensas publicadas reales, no una revisión.", "Fundamenta las cifras de '>90% de evasión, 100% con red-teaming humano' y el 'giro de 180 grados hacia la contención'.", "Justifica por qué cualquier métrica de '95% de detección' se trata como una nota reprobatoria."],
		},
	},
	"security::https://arxiv.org/pdf/2503.18813": {
		why: { en: "This is the existence proof the module leans on: a deterministic, architectural defense (capability tracking, control-flow and information-flow control) that gives provable security instead of asking the model to behave.", es: "Es la prueba de existencia en la que se apoya el módulo: una defensa arquitectónica y determinista (capability tracking, control-flow e information-flow control) que da seguridad demostrable en lugar de pedirle al modelo que se porte bien." },
		reasons: {
			en: ["Primary source from Google DeepMind and ETH Zurich; the system the module cites by name.", "Grounds the '77% of AgentDojo tasks with provable security vs ~84% undefended' claim and the dual-LLM/quarantine pattern.", "Anchors the 'architectural beats behavioral' thesis with a working implementation."],
			es: ["Fuente primaria de Google DeepMind y ETH Zurich; el sistema que el módulo cita por nombre.", "Fundamenta la afirmación '77% de tareas de AgentDojo con seguridad demostrable vs ~84% sin defensa' y el patrón dual-LLM/cuarentena.", "Ancla la tesis 'lo arquitectónico le gana a lo conductual' con una implementación funcional."],
		},
	},
	"security::https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/": {
		why: { en: "This supplies the module's core mental model for auditing agents by capability instead of intent: holding private data, untrusted content, and an external channel at once guarantees exfiltration.", es: "Aporta el modelo mental central del módulo para auditar agentes por capacidad en vez de por intención: tener a la vez datos privados, contenido no confiable y un canal externo garantiza la exfiltración." },
		reasons: {
			en: ["Origin of the 'lethal trifecta' frame the module builds an entire section and diagram around.", "Grounds the 'audit by capability, not intent' principle and the egress-allowlist remedy of breaking one vertex.", "The widely-cited articulation that the Agents Rule of Two later generalizes."],
			es: ["Origen del marco de la 'trifecta letal' sobre el que el módulo construye una sección entera y un diagrama.", "Fundamenta el principio 'auditar por capacidad, no por intención' y el remedio de la egress allowlist de romper un vértice.", "La formulación ampliamente citada que luego generaliza el Agents Rule of Two."],
		},
	},
	"tools-and-mcp::https://arxiv.org/pdf/2508.14925": {
		why: { en: "Grounds the security thesis that tool metadata is an attack surface: a description loads into context before the tool runs, so poisoned metadata can manipulate the agent with attack success up to ~72%.", es: "Sustenta la tesis de seguridad de que la metadata de la herramienta es una superficie de ataque: una descripción se carga en el contexto antes de ejecutar la herramienta, así que la metadata envenenada puede manipular al agente con éxito de ataque de hasta ~72%." },
		reasons: {
			en: ["Primary benchmark study measuring real MCP servers (45 servers, 353 tools, 1,312 cases), not anecdote.", "Source of the ~72% attack-success figure the tool-poisoning tab cites.", "Supports the precise scope caveat: it measures agent susceptibility, not how common poisoned servers are."],
			es: ["Estudio de benchmark primario que mide servidores MCP reales (45 servidores, 353 herramientas, 1.312 casos), no anécdotas.", "Origen de la cifra de éxito de ataque de ~72% que cita la pestaña de tool poisoning.", "Respalda el matiz de alcance: mide la susceptibilidad del agente, no qué tan comunes son los servidores envenenados."],
		},
	},
	"tools-and-mcp::https://www.anthropic.com/engineering/advanced-tool-use": {
		why: { en: "Grounds progressive disclosure: the Tool Search Tool and defer_loading, with ~-85% tokens while selection accuracy rises (Opus 4.5: 79.5% → 88.1%) and prompt caching stays intact.", es: "Sustenta la divulgación progresiva: el Tool Search Tool y defer_loading, con ~-85% tokens mientras la precisión de selección sube (Opus 4.5: 79.5% → 88.1%) y el prompt caching se mantiene." },
		reasons: {
			en: ["Primary platform announcement from Anthropic, the authority on its own tool-use API.", "Source of the specific defer_loading mechanism and the 79.5% → 88.1% selection-accuracy numbers.", "Backs the claim that progressive disclosure cuts tokens without breaking prompt caching."],
			es: ["Anuncio de plataforma primario de Anthropic, autoridad sobre su propia API de tool use.", "Origen del mecanismo concreto defer_loading y de las cifras de precisión de selección 79.5% → 88.1%.", "Respalda la afirmación de que la divulgación progresiva reduce tokens sin romper el prompt caching."],
		},
	},
	"tools-and-mcp::https://www.anthropic.com/engineering/code-execution-with-mcp": {
		why: { en: "Grounds the code-execution section: presenting MCP servers as navigable code and keeping intermediate results in a sandbox, which is where the ~150K → ~2K token (98.7%) figure comes from.", es: "Sustenta la sección de ejecución de código: presentar los servidores MCP como código navegable y mantener los resultados intermedios en un sandbox, de donde sale la cifra de ~150K → ~2K tokens (98.7%)." },
		reasons: {
			en: ["Primary Anthropic engineering source authored by the people who built the pattern (Jones, Kelly).", "Directly supplies the headline 98.7% token-reduction claim the module quotes.", "Grounds the honest tradeoff callout: code execution requires a secure, resource-limited sandbox."],
			es: ["Fuente de ingeniería primaria de Anthropic, escrita por quienes construyeron el patrón (Jones, Kelly).", "Aporta directamente la cifra principal de reducción de tokens del 98.7% que cita el módulo.", "Sustenta el callout del tradeoff honesto: la ejecución de código exige un sandbox seguro y con límites de recursos."],
		},
	},
	"tools-and-mcp::https://www.anthropic.com/engineering/writing-tools-for-agents": {
		why: { en: "This is the source the module's central reframe rests on: a tool is an interface for an LLM, so consolidate by workflow, return semantic values, and treat error text as a prompt surface.", es: "Es la fuente sobre la que descansa el replanteamiento central del módulo: una herramienta es una interfaz para un LLM, así que se consolida por workflow, se devuelven valores semánticos y el texto de error es una superficie de prompt." },
		reasons: {
			en: ["Primary engineering guidance from Anthropic, the team that builds the model and the tool-use API.", "Grounds the concrete claim to collapse list_users + list_events + create_event into one schedule_event.", "Source of the input_examples figure (complex-parameter accuracy 72% → 90%) cited in the deep-dive."],
			es: ["Guía de ingeniería primaria de Anthropic, el equipo que construye el modelo y la API de tool use.", "Sustenta la afirmación concreta de colapsar list_users + list_events + create_event en un único schedule_event.", "Origen del dato de input_examples (precisión de parámetros complejos 72% → 90%) citado en el deep-dive."],
		},
	},
};

/** Look up a source note by module slug + the source's url (or title fallback). */
export function getSourceNote(slug: string, key: string | undefined): SourceNote | undefined {
	if (!key) return undefined;
	return SOURCE_NOTES[`${slug}::${key}`];
}

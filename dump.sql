--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ticket_statuses; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.ticket_statuses (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.ticket_statuses OWNER TO "user";

--
-- Name: task_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.task_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_statuses_id_seq OWNER TO "user";

--
-- Name: task_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.task_statuses_id_seq OWNED BY public.ticket_statuses.id;


--
-- Name: templates; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.templates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    fields jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255),
    is_archived boolean DEFAULT false
);


ALTER TABLE public.templates OWNER TO "user";

--
-- Name: templates_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.templates_id_seq OWNER TO "user";

--
-- Name: templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.templates_id_seq OWNED BY public.templates.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    assignee_id integer,
    creator_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    template_id integer,
    custom_fields jsonb,
    status_id integer,
    is_archived boolean DEFAULT false
);


ALTER TABLE public.tickets OWNER TO "user";

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tickets_id_seq OWNER TO "user";

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: templates id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.templates ALTER COLUMN id SET DEFAULT nextval('public.templates_id_seq'::regclass);


--
-- Name: ticket_statuses id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ticket_statuses ALTER COLUMN id SET DEFAULT nextval('public.task_statuses_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.templates (id, name, fields, created_at, created_by, is_archived) FROM stdin;
5	aaaa	[]	2025-03-12 16:17:58.697	test@example.com	f
3	a	[{"name": "c", "type": "text", "options": []}, {"name": "d", "type": "dropdown", "options": ["1", "4", "t", "d", "i"]}]	2025-03-12 16:59:18.831	test@example.com	t
2	Networking Issue	[{"name": "Device Type", "type": "text"}, {"name": "Priority", "type": "dropdown", "options": ["Low", "Medium", "High"]}, {"name": "Affected Department", "type": "text"}]	2025-03-12 15:39:28.878	\N	t
10	deletable template	[]	2025-03-13 20:34:39.052736	test@example.com	t
11	optim	[{"name": "custom", "type": "dropdown", "options": ["1", "2", "3", "4"]}, {"name": "custom2", "type": "text", "options": []}]	2025-03-16 21:51:47.916299	test@example.com	f
12	a	[]	2025-03-16 22:05:55.001117	test@example.com	f
\.


--
-- Data for Name: ticket_statuses; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.ticket_statuses (id, name) FROM stdin;
1	New
2	In Progress
3	Waiting
4	Done
5	test
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.tickets (id, title, description, assignee_id, creator_id, created_at, template_id, custom_fields, status_id, is_archived) FROM stdin;
23	piu1	piu12	\N	3	2025-03-13 20:55:26.529744	5	{}	1	f
25	asd	as	\N	3	2025-03-14 12:31:35.812778	5	{}	5	f
17	ticket2	ticket2	1	1	2025-03-13 15:45:55.775579	5	{}	1	t
24	piu3	piu3	1	3	2025-03-13 20:55:26.529744	5	{}	1	t
16	ticket1	ticket1	\N	1	2025-03-13 15:45:55.775579	5	{}	1	t
26	opt1	opt1	\N	1	2025-03-16 21:49:48.23056	2	{"Priority": "Low", "Device Type": "opt1", "Affected Department": "opt1"}	1	f
29	opt4	opt4	1	1	2025-03-16 21:50:54.010345	2	{"Priority": "Medium", "Device Type": "opt4", "Affected Department": ""}	1	f
30	lorem	lorem	1	1	2025-03-16 21:52:15.529517	11	{"custom": "1", "custom2": ""}	1	f
31	wertyu		\N	1	2025-03-16 21:54:19.306704	11	{"custom": "3", "custom2": "wertyu"}	1	f
19	Lorem ipsum	Lorem ipsum	\N	1	2025-03-13 18:04:46.156746	5	{}	3	f
21	Lorem ipsum user	Lorem ipsum user	3	1	2025-03-13 18:09:48.213288	5	{}	1	t
22	ticket from deletable template	ticket from deletable template	3	1	2025-03-13 20:34:51.619944	10	{}	1	f
34	asd	asd	\N	1	2025-03-16 22:28:20.801502	11	{"custom": "1", "custom2": "asd"}	1	f
35	asd2	asd2	3	1	2025-03-16 22:28:20.801502	11	{"custom": "2", "custom2": "asd2"}	1	f
33	poiuy	poiuy	3	1	2025-03-16 21:56:01.411348	11	{"custom": "4", "custom2": "poiuy"}	1	t
32	poiuy	poiuy	\N	1	2025-03-16 21:56:01.411348	11	{"custom": "1", "custom2": "poiuy"}	1	t
28	opt3	opt3	\N	1	2025-03-16 21:50:54.010345	2	{"Priority": "Low", "Device Type": "opt3", "Affected Department": "opt3"}	1	t
27	opt2	opt2	3	1	2025-03-16 21:49:48.23056	2	{"Priority": "High", "Device Type": "opt2", "Affected Department": "opt2"}	1	t
20	Lorem ipsum	Lorem ipsum	\N	3	2025-03-13 18:09:01.336865	5	{}	3	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.users (id, email, password, role, created_at) FROM stdin;
3	user@example.com	$2a$06$suhYbAus.5McOz7zOpJu7eNWAm3KqDYZlphrri8Ou2OG8TFaCWB7y	user	2025-03-12 20:25:48.259
1	test@example.com	$2b$10$MjD3puEdzlpF3hVlPs3KKeD/yC6NX4VJANxG7Yi3gedKqEvnK7Dc.	admin	2025-03-10 01:42:46.933418
\.


--
-- Name: task_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.task_statuses_id_seq', 5, true);


--
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.templates_id_seq', 12, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.tickets_id_seq', 35, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: ticket_statuses task_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ticket_statuses
    ADD CONSTRAINT task_statuses_name_key UNIQUE (name);


--
-- Name: ticket_statuses task_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ticket_statuses
    ADD CONSTRAINT task_statuses_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: tickets fk_status; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT fk_status FOREIGN KEY (status_id) REFERENCES public.ticket_statuses(id);


--
-- Name: tickets tickets_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tickets tickets_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tickets tickets_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


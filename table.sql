--
-- PostgreSQL database dump
--

-- Dumped from database version 12.4 (Debian 12.4-1.pgdg100+1)
-- Dumped by pg_dump version 12.4 (Debian 12.4-1.pgdg100+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: artwork; Type: TABLE; Schema: public; Owner: "server"
--

CREATE TABLE public.artwork (
    id character varying(64) NOT NULL,
    type character varying(32),
    owner character varying(64),
    title character varying(150),
    date character varying(32),
    bgcolor character varying(12),
    votes integer,
    description character varying(300),
    votes_users character varying(300),
    visibility integer
);


ALTER TABLE public.artwork OWNER TO "server";

--
-- Name: permgroups; Type: TABLE; Schema: public; Owner: "server"
--

CREATE TABLE public.permgroups (
    name character varying(50),
    permissions character varying(256),
    priority integer
);


ALTER TABLE public.permgroups OWNER TO "server";

--
-- Name: user_session; Type: TABLE; Schema: public; Owner: "server"
--

CREATE TABLE public.user_session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.user_session OWNER TO "server";

--
-- Name: users; Type: TABLE; Schema: public; Owner: "server"
--

CREATE TABLE public.users (
    id character varying(50) NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(256) NOT NULL,
    email character varying(100),
    fullname character varying(100),
    groups character varying(50),
    description character varying(200)
);


ALTER TABLE public.users OWNER TO "server";


--
-- Data for Name: permgroups; Type: TABLE DATA; Schema: public; Owner: "server"
--

COPY public.permgroups (name, permissions, priority) FROM stdin;
user	{"canLogin":1,"upload":1}	10
mod	{"adminTools":1}	50
\.


--
-- Name: user_session session_pkey; Type: CONSTRAINT; Schema: public; Owner: "server"
--

ALTER TABLE ONLY public.user_session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: "server"
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: "server"
--

CREATE INDEX "IDX_session_expire" ON public.user_session USING btree (expire);


--
-- PostgreSQL database dump complete
--

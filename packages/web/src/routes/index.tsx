import { createFileRoute } from "@tanstack/solid-router";
import {
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";
import { withRpc } from "../lib/rpc";
import { IssueInsert } from "@planar/core/modules/issues/schema";
import { auth } from "../lib/auth";

const initial = {
  name: "",
  email: "",
  password: "",
};

export const Route = createFileRoute("/")({ component: HomeRoute });

function SignUp(props: {
  initial: { email: string; name: string; password: string };
}) {
  const [email, setEmail] = createSignal(props.initial.email);
  const [name, setName] = createSignal(props.initial.name);
  const [password, setPassword] = createSignal(props.initial.password);

  async function handleSignUp() {
    await auth.signUp.email({
      email: email(),
      password: password(),
      name: name(),
      callbackURL: "/",
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSignUp().then(() => {
          setName("");
          setEmail("");
          setPassword("");
        });
      }}
    >
      <p>Sign Up</p>
      <input
        type="name"
        placeholder="Name"
        value={name()}
        onInput={(e) => setName(e.currentTarget.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email()}
        onInput={(e) => setEmail(e.currentTarget.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}

function SignIn(props: { initial: { email: string; password: string } }) {
  const [email, setEmail] = createSignal(props.initial.email);
  const [password, setPassword] = createSignal(props.initial.password);

  async function handleSignIn() {
    await auth.signIn.email({
      email: email(),
      password: password(),
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSignIn().then(() => {
          setEmail("");
          setPassword("");
        });
      }}
    >
      <p>Sign In</p>
      <input
        type="email"
        placeholder="Email"
        value={email()}
        onInput={(e) => setEmail(e.currentTarget.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  );
}

function NoIssuesFound() {
  return <p>No issues found</p>;
}

const getIssues = () => withRpc("getIssues")((rpc) => rpc.issues.getAll())();

const createIssue = (issue: IssueInsert) =>
  withRpc("getIssues")((rpc) => rpc.issues.create({ payload: issue }))();

function HomeRoute() {
  const [issues, hooks] = createResource(getIssues);

  const session = auth.useSession();

  const [title, setTitle] = createSignal("db not working");
  const [description, setDescription] = createSignal("ughhh");

  const handleSignOut = async () => {
    await auth.signOut();
  };

  createEffect(() => {
    console.log("session: ", session().data);
  });

  return (
    <div>
      <Show when={session().error}>{(e) => <p>{e().message}</p>}</Show>
      <h1>planar</h1>

      <Show
        when={session().data?.user}
        fallback={
          <div>
            <p>Not logged in</p>
            <SignIn initial={initial} />
            <br />
            <br />
            <SignUp initial={initial} />
          </div>
        }
      >
        <div>
          <p>Logged in as: {session().data?.user.email}</p>

          <For each={issues()} fallback={<NoIssuesFound />}>
            {(issue) => (
              <div>
                <p>{issue.title}</p>
                <p>{issue.description}</p>
              </div>
            )}
          </For>
          <div>
            <input
              type="text"
              placeholder="Title"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
            />
            <input
              type="text"
              placeholder="Description"
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
            />
            <button
              onClick={() => {
                void createIssue({
                  title: title(),
                  description: description(),
                }).then((result) => {
                  void hooks.refetch();
                  console.log("result: ", result);
                  setTitle("");
                  setDescription("");
                });
              }}
            >
              Create
            </button>
          </div>
          <button
            onClick={() => {
              void handleSignOut();
            }}
          >
            Sign Out
          </button>
        </div>
      </Show>
    </div>
  );
}

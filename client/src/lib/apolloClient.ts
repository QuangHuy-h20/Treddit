import { useMemo } from "react";
import {
  ApolloClient,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import merge from "deepmerge";
import isEqual from "lodash/isEqual";
import { Post } from "../generated/graphql";
import { IncomingHttpHeaders } from "http";
import fetch from "isomorphic-unfetch";
export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";
import { onError } from "@apollo/client/link/error";
import Router from "next/router";

let apolloClient: ApolloClient<NormalizedCacheObject>;

export interface IApolloProps {
  [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject;
}

const errorLink = onError((errors) => {
  console.log("errors: ", errors);
  if (
    errors.graphQLErrors &&
    errors.graphQLErrors[0].extensions?.code === "UNAUTHENTICATED" &&
    errors.response
  ) {
    errors.response.errors = undefined;
    Router.replace("/login");
  }
});

function createApolloClient(headers: IncomingHttpHeaders | null = null) {
  const enhancedFetch = (url: RequestInfo, init: RequestInit) => {
    return fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        "Access-Control-Allow-Origin": "*",
        // here we pass the cookie along for each request
        Cookie: headers?.cookie ?? "",
      },
    });
  };

  const httpLink = new HttpLink({
    uri: "http://localhost:4000/graphql", // Server URL (must be absolute)
    credentials: "include", // Additional fetch() options like `credentials` or `headers`
    fetch: enhancedFetch,
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: false,
              merge(existing, incoming) {
                let paginatedPosts: Post[] = [];

                if (existing && existing.paginatedPosts) {
                  paginatedPosts = paginatedPosts.concat(
                    existing.paginatedPosts
                  );
                }

                if (incoming && incoming.paginatedPosts) {
                  paginatedPosts = paginatedPosts.concat(
                    incoming.paginatedPosts
                  );
                }

                return { ...incoming, paginatedPosts };
              },
            },
          },
        },
      },
    }),
    //     {
    //   typePolicies: {
    //     Query: {
    //       fields: {
    //         allPosts: concatPagination(),
    //       },
    //     },
    //   },
    // }
  });
}

export function initializeApollo(
  {
    headers,
    initialState,
  }: {
    headers?: IncomingHttpHeaders | null;
    initialState?: NormalizedCacheObject | null;
  } = { headers: null, initialState: null }
) {
  const _apolloClient = apolloClient ?? createApolloClient(headers);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: { props: IApolloProps }
) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps: IApolloProps) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(
    () => initializeApollo({ initialState: state }),
    [state]
  );
  return store;
}
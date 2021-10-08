# Community Solid Server release notes

## v2.0.0
### New features:
- ETag, Last-Modified, If-None-Match, and related conditional headers are supported.
- IDP components (registration, login, etc.) fully support JSON input and output.
- WebACL authorization supports groups.
- PATCHing containers works.
- PUT/POST requests with empty bodies are supported.
- A one-time setup is now supported when starting a server. This can be accessed by going to `/setup`.
  Certain configs enforce setup before the server can be used.
  These configs have corresponding `*-no-setup.json` configs where setup is disabled
  and behaviour is similar to 1.1.0.
- There is a new config to have a sparql backend with file storage for internal data:
  `sparql-file-storage.json`.
- Pod owners always have control access to resources stored in their pod.
- A server can be set up to restrict access to IDP components using WebACL.
  A consequence of this is that IDP components are only accessible using a trailing slash.
  E.g., `/idp/register/` works, `/idp/register` will error.

### Config changes:
The following changes are relevant in case you use a custom config.
Below are changes that are relevant for the imports in the default configs:
- There are 2 new configuration options that for which a valid option needs to be imported:
  - `/app/setup` determines how and if setup should be enabled.
  - `/identity/access` determines if IDP access (e.g., registration) should be restricted
- The `/app/init/default.json` configuration no longer initializes the root container. 
  This behaviour has been moved to the other options for `/app/init`.
- `/ldp/permissions` changed to `/ldp/modes` and only has a default option now.

The following changes are relevant in case you have a config that replaced certain features.
The path indicates which JSON-LD files were impacted by the change.
- `IdentityProviderHttpHandler` and `InteractionRoute` arguments have changed drastically. 
  - `/identity/handler/default.json`, `/identity/handler/interaction/*`, `/identity/registration/*`.
- All internal storage is now stored in the `/.internal/` container. 
  - `/storage/key-value/resource-store.json`. 
- Patching related classes have changed. 
  - `/storage/middleware/stores/patching.json`.
- `BasicRequestParser` now needs a `conditionsParser` argument.
  - `/ldp/handler/components/request-parser.json`.
- `LinkTypeParser` has been renamed to `LinkRelParser` and now takes mappings as input. 
  - `/ldp/metadata-parser/*`
- `ComposedAuxiliaryStrategy` `isRootRequired` is renamed to `requiredInRoot`. 
  - `/util/auxiliary/strategies/acl.json`.
- Many changes to authentication and authorization structure. 
  - Config `/ldp/authentication/*` and `/ldp/authorization/*`.
- All HttpHandlers have been changed. 
  - `/app/setup/handlers/setup.json`, `/http/handler/default.json`, `/identity/handler/default.json`, `/ldp/handler/default.json`.

## v1.1.0
New features:
- The `ConstantConverter` can now filter on media type using the `enabledMediaRanges` and `disabledMediaRanges` options. That way, the server can be configured to bypass a default UI when accessing images or PDF documents. (https://github.com/solid/community-server/discussions/895, https://github.com/solid/community-server/pull/925)

## v1.0.0
First release of the Community Solid Server.

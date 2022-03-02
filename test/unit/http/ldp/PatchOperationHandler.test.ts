import { PatchOperationHandler } from '../../../../src/http/ldp/PatchOperationHandler';
import type { Operation } from '../../../../src/http/Operation';
import { BasicRepresentation } from '../../../../src/http/representation/BasicRepresentation';
import type { Representation } from '../../../../src/http/representation/Representation';
import { BasicConditions } from '../../../../src/storage/BasicConditions';
import type { ResourceStore } from '../../../../src/storage/ResourceStore';
import { BadRequestHttpError } from '../../../../src/util/errors/BadRequestHttpError';
import { ConflictHttpError } from '../../../../src/util/errors/ConflictHttpError';
import { NotImplementedHttpError } from '../../../../src/util/errors/NotImplementedHttpError';
import { SOLID_HTTP } from '../../../../src/util/Vocabularies';
import { SimpleSuffixStrategy } from '../../../util/SimpleSuffixStrategy';

describe('A PatchOperationHandler', (): void => {
  let operation: Operation;
  let body: Representation;
  const conditions = new BasicConditions({});
  let store: jest.Mocked<ResourceStore>;
  let handler: PatchOperationHandler;
  const metaStrategy = new SimpleSuffixStrategy('.meta');

  beforeEach(async(): Promise<void> => {
    body = new BasicRepresentation('', 'text/turtle');
    operation = { method: 'PATCH', target: { path: 'http://test.com/foo' }, body, conditions, preferences: {}};

    store = {
      resourceExists: jest.fn(),
      modifyResource: jest.fn(),
    } as any;

    handler = new PatchOperationHandler(store, metaStrategy);
  });

  it('only supports PATCH operations.', async(): Promise<void> => {
    await expect(handler.canHandle({ operation })).resolves.toBeUndefined();
    operation.method = 'GET';
    await expect(handler.canHandle({ operation })).rejects.toThrow(NotImplementedHttpError);
  });

  it('errors if there is no content-type.', async(): Promise<void> => {
    operation.body.metadata.contentType = undefined;
    await expect(handler.handle({ operation })).rejects.toThrow(BadRequestHttpError);
  });

  it('creates the representation in the store and returns the correct response.', async(): Promise<void> => {
    const result = await handler.handle({ operation });
    expect(store.modifyResource).toHaveBeenCalledTimes(1);
    expect(store.modifyResource).toHaveBeenLastCalledWith(operation.target, body, conditions);
    expect(result.statusCode).toBe(201);
    expect(result.metadata?.get(SOLID_HTTP.location)?.value).toBe(operation.target.path);
    expect(result.data).toBeUndefined();
  });

  it('returns the correct response if the resource already exists.', async(): Promise<void> => {
    store.resourceExists.mockResolvedValueOnce(true);
    const result = await handler.handle({ operation });
    expect(store.modifyResource).toHaveBeenCalledTimes(1);
    expect(store.modifyResource).toHaveBeenLastCalledWith(operation.target, body, conditions);
    expect(result.statusCode).toBe(205);
    expect(result.metadata).toBeUndefined();
    expect(result.data).toBeUndefined();
  });

  it('returns the correct response if the resource is metadata.', async(): Promise<void> => {
    store.resourceExists.mockResolvedValueOnce(true);
    operation.target.path = 'http://test.com/foo.meta';
    const result = await handler.handle({ operation });
    expect(result.statusCode).toBe(201);
  });

  it('errors if there is no corresponding resource when trying to patch metadata.', async(): Promise<void> => {
    store.resourceExists.mockResolvedValueOnce(false);
    operation.target.path = 'http://test.com/foo.meta';
    await expect(handler.handle({ operation })).rejects.toThrow(ConflictHttpError);
  });

  it('errors when patching metadata of a metadata resource.', async(): Promise<void> => {
    store.resourceExists.mockResolvedValueOnce(true);
    operation.target.path = 'http://test.com/foo.meta.meta';
    await expect(handler.handle({ operation })).rejects.toThrow(ConflictHttpError);
  });
});

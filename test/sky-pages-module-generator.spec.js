/*jshint jasmine: true, node: true */
'use strict';

describe('SKY UX Builder module generator', () => {

  const runtimeUtils = require('../utils/runtime-test-utils.js');

  let generator;
  beforeEach(() => {
    generator = require('../lib/sky-pages-module-generator');
  });

  it('should return a source string', () => {
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });
    expect(source).toBeDefined();
  });

  it('should add the NotFoundComponent if it does not exist', () => {
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });
    expect(source).toContain("template: '404'");
  });

  it('should not add the NotFoundComponent if it exists', () => {
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        components: [
          {
            importPath: 'not-found.component.ts',
            componentName: 'NotFoundComponent'
          }
        ]
      }),
      skyux: {}
    });
    expect(source).toContain('NotFoundComponent');
    expect(source).not.toContain("template: '404'");
  });

  it('should allow the SKY UX Builder out alias to be overridden', () => {
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        skyPagesOutAlias: '..'
      }),
      skyux: {}
    });

    expect(source).toContain(
`import {
  AppExtrasModule
} from '../src/app/app-extras.module';`
    );
  });

  it('should allow the SKY UX path alias to be overridden', () => {
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        skyuxPathAlias: 'custom'
      }),
      skyux: {}
    });

    expect(source).toContain(
      `import { SkyModule } from 'custom/core';`
    );
  });

  it('should only provide the SkyAuthHttp service if the app is configured to use auth', () => {

    // Other items can exist so we're leaving out "import""
    const expectedImport = `, SkyAuthHttp } from 'sky-pages-internal/runtime';`;

    const expectedProvider = `{
      provide: SkyAuthHttp,
      useClass: SkyAuthHttp,
      deps: [XHRBackend, RequestOptions, SkyAppWindowRef, SkyAuthTokenProvider]
    }`;

    let source = generator.getSource({
      runtime:  runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    expect(source).not.toContain(expectedImport);
    expect(source).not.toContain(expectedProvider);

    source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {
        auth: true
      }
    });

    expect(source).toContain(expectedImport);
    expect(source).toContain(expectedProvider);
  });

  it('should not include routing in the module if includeRouteModule is false', () => {

    let expectedRouting = 'AppExtrasModule,routing';
    let sourceWithRouting = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    expect(sourceWithRouting).toContain(expectedRouting);

    let sourceWithoutRouting = generator.getSource(
      {
        runtime: runtimeUtils.getDefaultRuntime({
          includeRouteModule: false
        }),
        skyux: {}
      });

    expect(sourceWithoutRouting).not.toContain(expectedRouting);
  });

  it('should call `enableProdMode` if the command is build', () => {
    let source = generator.getSource({
      runtime:  runtimeUtils.getDefaultRuntime({
        command: 'build'
      }),
      skyux: {}
    });

    expect(source).toContain(
`import { enableProdMode } from '@angular/core';
enableProdMode();`);
  });

  it('should put auth-client in mock mode if the command is e2e', () => {
    let source = generator.getSource({
      runtime:  runtimeUtils.getDefaultRuntime({
        command: 'e2e'
      }),
      skyux: {}
    });

    expect(source).toContain(
`import { BBAuth } from '@blackbaud/auth-client';
BBAuth.mock = true;`);
  });

  it('should add routes to skyPagesConfig.runtime', () => {
    const routeGenerator = require('../lib/sky-pages-route-generator');
    const config = {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    };
    const routes = routeGenerator.getRoutes(config);
    const source = generator.getSource(config);

    expect(source).toContain(JSON.stringify(routes.routesForConfig));
  });
});

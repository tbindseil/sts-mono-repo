import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { WidgetService } from '../lib/widget_service';

export class MyWidgetServiceStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new WidgetService(this, 'Widgets');
    }
}

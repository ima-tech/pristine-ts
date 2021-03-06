import {Event, EventParserInterface} from "@pristine-ts/event";
import {ServiceDefinitionTagEnum, tag} from "@pristine-ts/common";
import {injectable} from "tsyringe";
import {SnsEventPayload} from "../event-payloads/sns.event-payload";
import {SnsEventType} from "../enums/sns-event-type.enum";
import {SnsModel} from "../models/sns.model";
import {SnsMessageAttributeModel} from "../models/sns-message-attribute.model";

@tag(ServiceDefinitionTagEnum.EventParser)
@injectable()
export class SnsEventParser implements EventParserInterface<SnsEventPayload>{

    private findEnum(eventName: string): SnsEventType{
        const keys = Object.keys(SnsEventType).filter(key => isNaN(Number(key)));
        for(const key of keys){
            if (SnsEventType[key] === eventName){
                return SnsEventType[key];
            }
        }
        return SnsEventType.UnknownSnsEvent;
    }

    parse(rawEvent: any): Event<SnsEventPayload>[] {
        const parsedEvents: Event<SnsEventPayload>[] = [];
        for(const record of rawEvent.Records) {
            const event = new Event<SnsEventPayload>();
            event.type = this.findEnum(record.Sns.Type)
            event.payload = new SnsEventPayload();

            event.payload.eventSource = record.EventSource;
            event.payload.eventSubscriptionArn = record.EventSubscriptionArn;
            event.payload.eventVersion = record.EventVersion;
            event.payload.sns = new SnsModel();
            event.payload.sns.signatureVersion = record.Sns.SignatureVersion;
            event.payload.sns.eventTime = new Date(record.Sns.Timestamp);
            event.payload.sns.signature = record.Sns.Signature;
            event.payload.sns.signingCertUrl = record.Sns.SigningCertUrl;
            event.payload.sns.messageId = record.Sns.MessageId;
            event.payload.sns.message = record.Sns.Message;
            event.payload.sns.type = record.Sns.Type;
            event.payload.sns.unsubscribeUrl = record.Sns.UnsubscribeUrl;
            event.payload.sns.topicArn = record.Sns.TopicArn;
            event.payload.sns.subject = record.Sns.Subject;

            if (record.Sns.hasOwnProperty("MessageAttributes")) {
                event.payload.sns.messageAttributes = [];
                for (const key in record.Sns.MessageAttributes) {
                    if (record.Sns.MessageAttributes.hasOwnProperty(key)) {
                        const attribute = new SnsMessageAttributeModel();
                        attribute.key = key;
                        attribute.type = record.Sns.MessageAttributes[key].Type;
                        attribute.value = record.Sns.MessageAttributes[key].Value;
                        event.payload.sns.messageAttributes.push(attribute);
                    }
                }
            }
            parsedEvents.push(event);
        }

        return parsedEvents;
    }

    supports(event: any): boolean {
        return event.hasOwnProperty("Records") &&
            Array.isArray(event.Records) &&
            event.Records[0].hasOwnProperty("EventSource") &&
            event.Records[0].EventSource === "aws:sns" &&
            event.Records[0].hasOwnProperty("Sns")
    }

}

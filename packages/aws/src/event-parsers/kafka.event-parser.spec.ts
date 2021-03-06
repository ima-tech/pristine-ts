import "reflect-metadata"
import {Event} from "@pristine-ts/event";
import {KafkaEventParser} from "./kafka.event-parser";
import {KafkaEventType} from "../enums/kafka-event-type.enum";
import {KafkaEventPayload} from "../event-payloads/kafka.event-payload";

describe("Kafka event parser", () => {
    const rawEvent = {
        "eventSource": "aws:kafka",
        "eventSourceArn": "arn:aws:kafka:us-east-1:account:cluster/vpc/uuid",
        "records": {
            "mytopic-0": [
                {
                    "topic": "mytopic0",
                    partition: 0,
                    offset: 15,
                    timestamp: 1596480920837,
                    timestampType: "CREATE_TIME",
                    value: "aGVsbG8gZnJvbSBrYWZrYQ=="
                }
            ],
            "mytopic-1": [
                {
                    "topic": "mytopic1",
                    partition: 0,
                    offset: 15,
                    timestamp: 1596480920837,
                    timestampType: "CREATE_TIME",
                    value: "ewoia2V5IjogInZhbHVlIgp9Cg=="
                }
            ]
        }
    };

    it("should support an event from kafka", () => {
        const kafkaEventParser = new KafkaEventParser();

        expect(kafkaEventParser.supports(rawEvent)).toBeTruthy();
    })

    it("should transform an event from kafka", () => {

        const kafkaEventParser = new KafkaEventParser();

        const kafkaEvent1: Event<KafkaEventPayload> = {
            type: KafkaEventType.KafkaEvent,
            payload: {
                eventSource: "aws:kafka",
                eventSourceArn: "arn:aws:kafka:us-east-1:account:cluster/vpc/uuid",
                topicName: "mytopic0",
                messages: [
                    {
                        offset: 15,
                        partition: 0,
                        timestamp: new Date(1596480920837),
                        timestampType: "CREATE_TIME",
                        value: "hello from kafka"
                    }
                ]
            }
        };

        const kafkaEvent2: Event<KafkaEventPayload> = {
            type: KafkaEventType.KafkaEvent,
            payload: {
                eventSource: "aws:kafka",
                eventSourceArn: "arn:aws:kafka:us-east-1:account:cluster/vpc/uuid",
                topicName: "mytopic1",
                messages: [
                    {
                        offset: 15,
                        partition: 0,
                        timestamp: new Date(1596480920837),
                        timestampType: "CREATE_TIME",
                        value: {
                            key:"value"
                        }
                    }
                ]
            }
        };
        expect(kafkaEventParser.parse(rawEvent)).toEqual([kafkaEvent1, kafkaEvent2]);
    })
})

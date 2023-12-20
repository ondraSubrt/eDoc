- structure Types
    - event
    - global
    - reference 

- how to send an event to the endpoint (structure)
    - event
        - event and context
        - example: 
            {
                event: 'user.download.products'
                user: {
                    download: {
                        products: [
                            {...},
                            {...}
                        ]
                    }
                }
            }
    - globals
        - example:
            {
                session: {...},
                server: {...}
            }
    - TODO - more info



# Luciano Leite Barbosa - Esquisse


## Audio graph

```
                    master (`/volume`)
                            |
                       group-master 
                    (`/group-x/volume`)
                    /                 \
          sine-volume                granular-volume
(`/group-x/sine/volume`)          (`/group-x/sine/volume`)
                  |                      |
            sine-gain                granular-envelop
          (cf. config)           (`/group-x/granular/envelop`)
                  |
            sine-envelop 
    (`/group-x/sine/envelop`)
```

## List of OSC commands

### general

/

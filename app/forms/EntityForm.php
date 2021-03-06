<?php
/**
 * Date: 3.12.12
 * Time: 20:14
 * Author: Michal Májský
 */


namespace SRS\Form;

use \Doctrine\Common\Collections\ArrayCollection, \Doctrine\ORM\PersistentCollection, \Nette\Application\UI;


/**
 * Rodic pro formulare pracujici s entitami
 * @author Jan Marek
 * @author Michal Májský
 */
class EntityForm extends UI\Form
{

    /**
     * @var \SRS\Model\BaseEntity
     */
    private $entity;

    /**
     * Nastavi default hodnoty formulare  dle vlastnosti entity
     * @param $entity
     */
    public function bindEntity($entity)
    {
        $this->entity = $entity;

        foreach ($this->getComponents() as $name => $input) {
            if (method_exists($entity, "get$name")) {
                $method = "get$name";
            } elseif (method_exists($entity, "is$name")) {
                $method = "is$name";
            } else {
                continue;
            }

            $value = $entity->$method();

            if ($value instanceof ArrayCollection || $value instanceof PersistentCollection) {
                $value = array_map(function ($entity) {
                    return $entity->getId();
                }, $value->toArray());
            } elseif (method_exists($value, 'getId')) {
                $value = $value->getId();
            }

            if ($value instanceof \DateTime) {
                if ($value->format("H:i") == "00:00")
                    $value = $value->format('d.m.Y');
                else
                    $value = $value->format('d.m.Y H:i');
            }

            $input->setDefaultValue($value);
        }
    }


    public function getEntity()
    {
        return $this->entity;
    }

    /**
     * Vytvori pole ve vhodnem formatu pro Nette Select
     * @param array $entities Pole entit
     * @param string $id identifikator entity
     * @param string $label Jmeno property, ktera se ma zobrazit ve formulari
     * @return array
     */
    public static function getFormChoices($entities, $id = 'id', $label = 'name')
    {
        $choices = array();
        foreach ($entities as $value) {
            $choices[$value->{$id}] = $value->{$label};
        }
        return $choices;
    }
}